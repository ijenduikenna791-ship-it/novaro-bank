-- =====================================================================
--  NOVARO BANK  -  Supabase database schema
--  Run this whole file once in: Supabase Dashboard -> SQL Editor -> New query
--  It is safe to re-run: it drops and recreates the app objects.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Clean re-run
-- ---------------------------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;
drop table if exists public.admin_audit cascade;
drop table if exists public.support_tickets cascade;
drop table if exists public.notifications cascade;
drop table if exists public.cards cascade;
drop table if exists public.transactions cascade;
drop table if exists public.accounts cascade;
drop table if exists public.profiles cascade;

-- ---------------------------------------------------------------------
-- TABLES
-- ---------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  email       text not null,
  phone       text,
  address     text,
  role        text not null default 'user'       check (role in ('user','admin')),
  status      text not null default 'active'     check (status in ('active','frozen','suspended')),
  kyc_status  text not null default 'unverified' check (kyc_status in ('unverified','pending','verified','rejected')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.accounts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references public.profiles(id) on delete cascade,
  account_number  text not null unique,
  account_type    text not null default 'checking',
  currency        text not null default 'USD',
  balance         numeric(14,2) not null default 0 check (balance >= 0),
  created_at      timestamptz not null default now()
);

create table public.transactions (
  id                       uuid primary key default gen_random_uuid(),
  reference                text not null unique
                           default ('NVR' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))),
  account_id               uuid not null references public.accounts(id) on delete cascade,
  counterparty_account_id  uuid references public.accounts(id) on delete set null,
  counterparty_name        text,
  type        text not null check (type in ('deposit','withdrawal','transfer_in','transfer_out','card_funding','card_refund')),
  direction   text not null check (direction in ('credit','debit')),
  amount      numeric(14,2) not null check (amount > 0),
  status      text not null default 'completed' check (status in ('pending','completed','rejected')),
  method      text,
  description text,
  details     jsonb not null default '{}'::jsonb,
  balance_after numeric(14,2),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  created_at  timestamptz not null default now()
);
create index on public.transactions (account_id, created_at desc);
create index on public.transactions (status);

create table public.cards (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  label         text not null default 'Virtual Card',
  card_number   text not null,
  cvv           text not null,
  holder_name   text not null,
  expiry_month  int  not null,
  expiry_year   int  not null,
  theme         text not null default 'midnight',
  balance       numeric(14,2) not null default 0 check (balance >= 0),
  status        text not null default 'active' check (status in ('active','frozen','terminated')),
  created_at    timestamptz not null default now()
);
create index on public.cards (user_id);

create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  body        text,
  kind        text not null default 'info',
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);
create index on public.notifications (user_id, created_at desc);

create table public.support_tickets (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  subject      text not null,
  message      text not null,
  status       text not null default 'open' check (status in ('open','answered','closed')),
  admin_reply  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.admin_audit (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid references public.profiles(id) on delete set null,
  action      text not null,
  target_user uuid references public.profiles(id) on delete set null,
  details     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- HELPERS
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.generate_account_number()
returns text language plpgsql as $$
declare n text;
begin
  loop
    n := '40' || lpad((floor(random() * 100000000))::bigint::text, 8, '0');
    exit when not exists (select 1 from public.accounts where account_number = n);
  end loop;
  return n;
end $$;

create or replace function public.notify(p_user uuid, p_title text, p_body text, p_kind text default 'info')
returns void language sql security definer set search_path = public as $$
  insert into public.notifications (user_id, title, body, kind) values (p_user, p_title, p_body, p_kind);
$$;

-- New sign-up -> profile + checking account + welcome notification
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
          new.email,
          new.raw_user_meta_data->>'phone');

  insert into public.accounts (user_id, account_number)
  values (new.id, public.generate_account_number());

  perform public.notify(new.id, 'Welcome to Novaro',
    'Your checking account is ready. Add money or create a virtual card to get started.', 'success');
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Users may edit their own name/phone/address only. Role/status/KYC are admin-only.
create or replace function public.protect_profile_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() is null for the SQL editor / service role (used to create the first admin)
  if auth.uid() is not null and not public.is_admin() then
    new.role       := old.role;
    new.status     := old.status;
    new.kyc_status := case when old.kyc_status in ('unverified','rejected') and new.kyc_status = 'pending'
                           then 'pending' else old.kyc_status end;
    new.email      := old.email;
  end if;
  new.updated_at := now();
  return new;
end $$;

create trigger profiles_protect before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- ---------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Money tables have NO insert/update policies: balances can only move
-- through the security-definer functions below.
-- ---------------------------------------------------------------------
alter table public.profiles        enable row level security;
alter table public.accounts        enable row level security;
alter table public.transactions    enable row level security;
alter table public.cards           enable row level security;
alter table public.notifications   enable row level security;
alter table public.support_tickets enable row level security;
alter table public.admin_audit     enable row level security;

create policy "profiles: read own or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles: update own" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

create policy "accounts: read own or admin" on public.accounts
  for select using (user_id = auth.uid() or public.is_admin());

create policy "transactions: read own or admin" on public.transactions
  for select using (
    public.is_admin() or account_id in (select id from public.accounts where user_id = auth.uid())
  );

create policy "cards: read own or admin" on public.cards
  for select using (user_id = auth.uid() or public.is_admin());

create policy "notifications: read own" on public.notifications
  for select using (user_id = auth.uid());
create policy "notifications: mark read" on public.notifications
  for update using (user_id = auth.uid());

create policy "tickets: read own or admin" on public.support_tickets
  for select using (user_id = auth.uid() or public.is_admin());
create policy "tickets: create own" on public.support_tickets
  for insert with check (user_id = auth.uid());

create policy "audit: admin read" on public.admin_audit
  for select using (public.is_admin());

-- ---------------------------------------------------------------------
-- BANKING FUNCTIONS (called from the Next.js API routes)
-- ---------------------------------------------------------------------

-- Internal helper: the caller's account row, locked, and must be active
create or replace function public._my_active_account()
returns public.accounts language plpgsql security definer set search_path = public as $$
declare a public.accounts; s text;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  select status into s from public.profiles where id = auth.uid();
  if s <> 'active' then raise exception 'Your account is %. Contact support.', s; end if;
  select * into a from public.accounts where user_id = auth.uid() for update;
  if a.id is null then raise exception 'Account not found'; end if;
  return a;
end $$;

-- Look up a recipient before sending (returns a masked name only)
create or replace function public.lookup_account(p_account_number text)
returns json language plpgsql security definer set search_path = public as $$
declare r record;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  select p.full_name, a.account_number, a.user_id into r
  from public.accounts a join public.profiles p on p.id = a.user_id
  where a.account_number = trim(p_account_number);
  if r is null then raise exception 'No account found with that number'; end if;
  if r.user_id = auth.uid() then raise exception 'You cannot send money to yourself'; end if;
  return json_build_object('name', r.full_name, 'account_number', r.account_number);
end $$;

-- Transfer to another Novaro account.
-- Up to $10,000: instant. Above: funds are held and the transfer waits for admin review.
create or replace function public.transfer_funds(p_to_account text, p_amount numeric, p_note text default null)
returns json language plpgsql security definer set search_path = public as $$
declare
  src public.accounts;
  dst public.accounts;
  src_name text; dst_name text;
  needs_review boolean := p_amount > 10000;
  out_ref text;
begin
  if p_amount is null or p_amount <= 0 then raise exception 'Enter a valid amount'; end if;
  if p_amount > 1000000 then raise exception 'Amount exceeds the single-transfer limit'; end if;

  src := public._my_active_account();
  select * into dst from public.accounts where account_number = trim(p_to_account);
  if dst.id is null then raise exception 'Recipient account not found'; end if;
  if dst.id = src.id then raise exception 'You cannot send money to yourself'; end if;

  -- lock both rows in a stable order to avoid deadlocks
  perform 1 from public.accounts where id in (src.id, dst.id) order by id for update;
  select * into src from public.accounts where id = src.id;
  select * into dst from public.accounts where id = dst.id;

  if src.balance < p_amount then raise exception 'Insufficient funds'; end if;

  select full_name into src_name from public.profiles where id = src.user_id;
  select full_name into dst_name from public.profiles where id = dst.user_id;

  update public.accounts set balance = balance - p_amount where id = src.id;

  insert into public.transactions (account_id, counterparty_account_id, counterparty_name, type, direction,
                                   amount, status, method, description, balance_after)
  values (src.id, dst.id, dst_name, 'transfer_out', 'debit', p_amount,
          case when needs_review then 'pending' else 'completed' end,
          'internal', coalesce(nullif(p_note,''), 'Transfer to ' || dst_name), src.balance - p_amount)
  returning reference into out_ref;

  if not needs_review then
    update public.accounts set balance = balance + p_amount where id = dst.id;
    insert into public.transactions (account_id, counterparty_account_id, counterparty_name, type, direction,
                                     amount, status, method, description, balance_after, details)
    values (dst.id, src.id, src_name, 'transfer_in', 'credit', p_amount, 'completed', 'internal',
            coalesce(nullif(p_note,''), 'Transfer from ' || src_name), dst.balance + p_amount,
            json_build_object('linked_reference', out_ref)::jsonb);
    perform public.notify(dst.user_id, 'Money received',
      src_name || ' sent you $' || to_char(p_amount, 'FM999,999,990.00'), 'success');
  end if;

  perform public.notify(src.user_id,
    case when needs_review then 'Transfer under review' else 'Transfer sent' end,
    '$' || to_char(p_amount, 'FM999,999,990.00') || ' to ' || dst_name ||
    case when needs_review then '. Large transfers are reviewed within 24 hours.' else '.' end,
    case when needs_review then 'warning' else 'success' end);

  return json_build_object('reference', out_ref,
                           'status', case when needs_review then 'pending' else 'completed' end,
                           'recipient', dst_name);
end $$;

-- Deposit request (bank wire / ACH / mobile check). Credited when an admin confirms receipt.
create or replace function public.request_deposit(p_amount numeric, p_method text, p_note text default null)
returns json language plpgsql security definer set search_path = public as $$
declare a public.accounts; ref text;
begin
  if p_amount is null or p_amount <= 0 then raise exception 'Enter a valid amount'; end if;
  if p_method not in ('wire','ach','check') then raise exception 'Invalid deposit method'; end if;
  a := public._my_active_account();
  insert into public.transactions (account_id, type, direction, amount, status, method, description)
  values (a.id, 'deposit', 'credit', p_amount, 'pending', p_method,
          coalesce(nullif(p_note,''), initcap(p_method) || ' deposit'))
  returning reference into ref;
  perform public.notify(auth.uid(), 'Deposit submitted',
    'We will credit $' || to_char(p_amount, 'FM999,999,990.00') || ' once the funds arrive.', 'info');
  return json_build_object('reference', ref, 'status', 'pending');
end $$;

-- Withdrawal to an external bank. Funds are held immediately; admin marks it paid or rejects (refund).
create or replace function public.request_withdrawal(p_amount numeric, p_method text, p_details jsonb)
returns json language plpgsql security definer set search_path = public as $$
declare a public.accounts; ref text;
begin
  if p_amount is null or p_amount <= 0 then raise exception 'Enter a valid amount'; end if;
  if p_method not in ('wire','ach') then raise exception 'Invalid withdrawal method'; end if;
  a := public._my_active_account();
  if a.balance < p_amount then raise exception 'Insufficient funds'; end if;
  update public.accounts set balance = balance - p_amount where id = a.id;
  insert into public.transactions (account_id, type, direction, amount, status, method, description, details, balance_after)
  values (a.id, 'withdrawal', 'debit', p_amount, 'pending', p_method,
          'Withdrawal to ' || coalesce(p_details->>'bank_name', 'external bank'),
          coalesce(p_details, '{}'::jsonb), a.balance - p_amount)
  returning reference into ref;
  perform public.notify(auth.uid(), 'Withdrawal requested',
    '$' || to_char(p_amount, 'FM999,999,990.00') || ' is on hold while we process your withdrawal.', 'info');
  return json_build_object('reference', ref, 'status', 'pending');
end $$;

-- Virtual cards
create or replace function public.create_card(p_label text, p_theme text default 'midnight')
returns public.cards language plpgsql security definer set search_path = public as $$
declare c public.cards; n text; holder text; cnt int;
begin
  perform public._my_active_account();
  select count(*) into cnt from public.cards where user_id = auth.uid() and status <> 'terminated';
  if cnt >= 5 then raise exception 'You can have up to 5 active cards'; end if;
  select full_name into holder from public.profiles where id = auth.uid();
  n := '5' || lpad((floor(random() * 1e15))::bigint::text, 15, '0');
  insert into public.cards (user_id, label, card_number, cvv, holder_name, expiry_month, expiry_year, theme)
  values (auth.uid(), coalesce(nullif(trim(p_label),''), 'Virtual Card'), n,
          lpad((floor(random()*1000))::int::text, 3, '0'), upper(holder),
          (floor(random()*12)+1)::int, extract(year from now())::int + 4,
          coalesce(p_theme, 'midnight'))
  returning * into c;
  perform public.notify(auth.uid(), 'Virtual card created', c.label || ' ending ' || right(n, 4) || ' is ready to use.', 'success');
  return c;
end $$;

create or replace function public.set_card_status(p_card uuid, p_status text)
returns void language plpgsql security definer set search_path = public as $$
declare c public.cards; a public.accounts;
begin
  if p_status not in ('active','frozen','terminated') then raise exception 'Invalid status'; end if;
  select * into c from public.cards where id = p_card and user_id = auth.uid() for update;
  if c.id is null then raise exception 'Card not found'; end if;
  if c.status = 'terminated' then raise exception 'This card is terminated'; end if;
  if p_status = 'terminated' and c.balance > 0 then
    a := public._my_active_account();
    update public.accounts set balance = balance + c.balance where id = a.id;
    insert into public.transactions (account_id, type, direction, amount, method, description, balance_after)
    values (a.id, 'card_refund', 'credit', c.balance, 'card', 'Balance returned from ' || c.label, a.balance + c.balance);
    update public.cards set balance = 0 where id = c.id;
  end if;
  update public.cards set status = p_status where id = c.id;
end $$;

create or replace function public.fund_card(p_card uuid, p_amount numeric)
returns void language plpgsql security definer set search_path = public as $$
declare c public.cards; a public.accounts;
begin
  if p_amount is null or p_amount <= 0 then raise exception 'Enter a valid amount'; end if;
  a := public._my_active_account();
  select * into c from public.cards where id = p_card and user_id = auth.uid() for update;
  if c.id is null then raise exception 'Card not found'; end if;
  if c.status <> 'active' then raise exception 'Card must be active to add funds'; end if;
  if a.balance < p_amount then raise exception 'Insufficient funds'; end if;
  update public.accounts set balance = balance - p_amount where id = a.id;
  update public.cards set balance = balance + p_amount where id = c.id;
  insert into public.transactions (account_id, type, direction, amount, method, description, balance_after)
  values (a.id, 'card_funding', 'debit', p_amount, 'card', 'Funded ' || c.label || ' ' || right(c.card_number, 4), a.balance - p_amount);
end $$;

-- ---------------------------------------------------------------------
-- ADMIN FUNCTIONS
-- ---------------------------------------------------------------------
create or replace function public.admin_review_transaction(p_tx uuid, p_approve boolean, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare t public.transactions; a public.accounts; dst public.accounts; owner uuid; src_name text;
begin
  if not public.is_admin() then raise exception 'Admins only'; end if;
  select * into t from public.transactions where id = p_tx for update;
  if t.id is null then raise exception 'Transaction not found'; end if;
  if t.status <> 'pending' then raise exception 'Transaction already reviewed'; end if;
  select * into a from public.accounts where id = t.account_id for update;
  owner := a.user_id;

  if t.type = 'deposit' then
    if p_approve then
      update public.accounts set balance = balance + t.amount where id = a.id;
      update public.transactions set balance_after = a.balance + t.amount where id = t.id;
      perform public.notify(owner, 'Deposit credited', '$' || to_char(t.amount,'FM999,999,990.00') || ' was added to your account.', 'success');
    else
      perform public.notify(owner, 'Deposit declined', coalesce(p_note, 'We could not verify this deposit.'), 'error');
    end if;

  elsif t.type = 'withdrawal' then
    if p_approve then
      perform public.notify(owner, 'Withdrawal sent', '$' || to_char(t.amount,'FM999,999,990.00') || ' is on its way to your bank.', 'success');
    else
      update public.accounts set balance = balance + t.amount where id = a.id;
      perform public.notify(owner, 'Withdrawal declined', coalesce(p_note, 'Funds were returned to your balance.'), 'error');
    end if;

  elsif t.type = 'transfer_out' then
    if p_approve then
      select * into dst from public.accounts where id = t.counterparty_account_id for update;
      select full_name into src_name from public.profiles where id = owner;
      update public.accounts set balance = balance + t.amount where id = dst.id;
      insert into public.transactions (account_id, counterparty_account_id, counterparty_name, type, direction,
                                       amount, status, method, description, balance_after, details)
      values (dst.id, a.id, src_name, 'transfer_in', 'credit', t.amount, 'completed', 'internal',
              'Transfer from ' || src_name, dst.balance + t.amount,
              json_build_object('linked_reference', t.reference)::jsonb);
      perform public.notify(dst.user_id, 'Money received', src_name || ' sent you $' || to_char(t.amount,'FM999,999,990.00'), 'success');
      perform public.notify(owner, 'Transfer approved', 'Your transfer ' || t.reference || ' was completed.', 'success');
    else
      update public.accounts set balance = balance + t.amount where id = a.id;
      perform public.notify(owner, 'Transfer declined', coalesce(p_note, 'Funds were returned to your balance.'), 'error');
    end if;
  else
    raise exception 'This transaction type cannot be reviewed';
  end if;

  update public.transactions
     set status = case when p_approve then 'completed' else 'rejected' end,
         reviewed_by = auth.uid(), reviewed_at = now(), review_note = p_note
   where id = t.id;

  insert into public.admin_audit (admin_id, action, target_user, details)
  values (auth.uid(), case when p_approve then 'approve_' else 'reject_' end || t.type, owner,
          json_build_object('reference', t.reference, 'amount', t.amount, 'note', p_note)::jsonb);
end $$;

create or replace function public.admin_update_user(p_user uuid, p_status text default null,
                                                    p_kyc text default null, p_role text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Admins only'; end if;
  if p_user = auth.uid() and p_role is not null and p_role <> 'admin' then
    raise exception 'You cannot remove your own admin role';
  end if;
  update public.profiles set
    status     = coalesce(p_status, status),
    kyc_status = coalesce(p_kyc, kyc_status),
    role       = coalesce(p_role, role)
  where id = p_user;

  if p_status is not null then
    perform public.notify(p_user, 'Account status updated', 'Your account is now ' || p_status || '.',
                          case when p_status = 'active' then 'success' else 'warning' end);
  end if;
  if p_kyc = 'verified' then
    perform public.notify(p_user, 'Identity verified', 'Your profile is fully verified.', 'success');
  end if;

  insert into public.admin_audit (admin_id, action, target_user, details)
  values (auth.uid(), 'update_user', p_user,
          json_build_object('status', p_status, 'kyc', p_kyc, 'role', p_role)::jsonb);
end $$;

create or replace function public.admin_reply_ticket(p_ticket uuid, p_reply text, p_close boolean default false)
returns void language plpgsql security definer set search_path = public as $$
declare t public.support_tickets;
begin
  if not public.is_admin() then raise exception 'Admins only'; end if;
  update public.support_tickets
     set admin_reply = coalesce(nullif(p_reply,''), admin_reply),
         status = case when p_close then 'closed' else 'answered' end,
         updated_at = now()
   where id = p_ticket returning * into t;
  if t.id is null then raise exception 'Ticket not found'; end if;
  perform public.notify(t.user_id, 'Support replied', 'Re: ' || t.subject, 'info');
end $$;

create or replace function public.admin_stats()
returns json language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Admins only'; end if;
  return json_build_object(
    'users',          (select count(*) from public.profiles where role = 'user'),
    'active_users',   (select count(*) from public.profiles where role = 'user' and status = 'active'),
    'total_deposits', (select coalesce(sum(balance),0) from public.accounts),
    'pending',        (select count(*) from public.transactions where status = 'pending'),
    'open_tickets',   (select count(*) from public.support_tickets where status = 'open'),
    'cards',          (select count(*) from public.cards where status <> 'terminated'),
    'volume_30d',     (select coalesce(sum(amount),0) from public.transactions
                        where status = 'completed' and direction = 'debit' and created_at > now() - interval '30 days'),
    'daily', (
      select coalesce(json_agg(d order by d.day), '[]'::json) from (
        select to_char(g.day, 'YYYY-MM-DD') as day,
               coalesce(sum(t.amount) filter (where t.direction = 'credit'), 0) as inflow,
               coalesce(sum(t.amount) filter (where t.direction = 'debit'), 0)  as outflow
        from generate_series(current_date - 13, current_date, interval '1 day') g(day)
        left join public.transactions t
          on t.created_at::date = g.day::date and t.status = 'completed'
        group by g.day
      ) d
    )
  );
end $$;

-- Only signed-in users may call the functions
revoke all on function public._my_active_account() from public, anon;
grant execute on function public.lookup_account(text)                      to authenticated;
grant execute on function public.transfer_funds(text, numeric, text)       to authenticated;
grant execute on function public.request_deposit(numeric, text, text)      to authenticated;
grant execute on function public.request_withdrawal(numeric, text, jsonb)  to authenticated;
grant execute on function public.create_card(text, text)                   to authenticated;
grant execute on function public.set_card_status(uuid, text)               to authenticated;
grant execute on function public.fund_card(uuid, numeric)                  to authenticated;
grant execute on function public.admin_review_transaction(uuid, boolean, text) to authenticated;
grant execute on function public.admin_update_user(uuid, text, text, text) to authenticated;
grant execute on function public.admin_reply_ticket(uuid, text, boolean)   to authenticated;
grant execute on function public.admin_stats()                             to authenticated;

-- =====================================================================
-- MAKE AN ADMIN (alternative to `npm run create-admin`):
--   1. Register normally on /register with the admin email
--   2. Run:  update public.profiles set role = 'admin' where email = 'admin@novaro.app';
-- =====================================================================
