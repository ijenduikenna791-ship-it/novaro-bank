# Novaro Bank — Next.js + Tailwind + Supabase

A full-stack digital banking app:

- **Intro loader** — animated logo, wordmark and progress counter, then a curtain reveal into the landing page
- **Landing page** — navy design, 3D floating card stack, partner marquee, scroll animations, fully responsive
- **User dashboard** — balance card with live clock, send money, add money, withdraw, virtual cards, activity, stats chart, support tickets, notifications, profile
- **Admin console** — live stats and chart, review queue (approve or reject deposits, withdrawals and large transfers), customer management (freeze, suspend, verify, make admin), support replies, audit log
- **Real backend** — Supabase Auth + Postgres with row-level security. Money only moves through database functions, so balances can't be edited from the browser.

Icons: [Hugeicons](https://hugeicons.com) free set. Photos: [Pexels](https://www.pexels.com).

---

## 1. Setup (about 10 minutes)

### Step 1 — Install
You need Node.js 20 or newer.
```bash
npm install
```

### Step 2 — Create the Supabase project
1. Go to https://supabase.com, create a free project.
2. Open **SQL Editor → New query**, paste everything from `supabase/schema.sql`, click **Run**.
   (Warning: running it again later deletes all app data and recreates the tables.)
3. For quick testing, go to **Authentication → Sign In / Providers → Email** and turn **off** "Confirm email".
   (Leave it on in production. If it is on, also set **Authentication → URL Configuration → Site URL** to your site address.)

### Step 3 — Environment variables
Copy `.env.example` to `.env.local` and fill in the values from **Project Settings → API**:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...      # secret, server only
```

### Step 4 — Create the admin account
```bash
npm run create-admin
```
Default admin login (change `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env.local` before running):

| | |
|---|---|
| URL | `http://localhost:3000/admin/login` |
| Email | `admin@novaro.app` |
| Password | `NovaroAdmin#2026` |

Change the password after your first login (Dashboard → Profile → Change password).

*No terminal access?* Register normally at `/register`, then run this in the SQL Editor:
```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

### Step 5 — Run
```bash
npm run dev
```
Open http://localhost:3000.

### Deploy (Vercel)
Push to GitHub → import in Vercel → add the same environment variables → deploy.
Set `NEXT_PUBLIC_SITE_URL` to your live URL and add it in Supabase **URL Configuration**.

---

## 2. How money moves

| Action | What happens |
|---|---|
| Transfer up to $10,000 | Instant. Sender debited, recipient credited, both notified. |
| Transfer above $10,000 | Sender's funds are held; admin releases or rejects (refund). |
| Add money (wire / ACH / check) | Creates a pending deposit. Admin confirms once funds arrive, then it's credited. |
| Withdraw | Funds held immediately; admin marks it paid, or rejects and the money is returned. |
| Fund a card | Moves money from the account to the card. Closing a card returns its balance. |

Every admin decision is written to `admin_audit`. The deposit instructions page uses placeholder
bank details — edit them in `app/dashboard/deposit/page.js`.

Try it: register two users, make a deposit as user A, approve it in the admin console, then send money to user B's account number.

---

## 3. Folder structure

```
novaro-bank/
├── app/
│   ├── layout.js                  Root layout, fonts, metadata
│   ├── globals.css                Tailwind + design tokens and component classes
│   ├── page.js                    Landing page (with intro loader)
│   ├── loading.js / not-found.js
│   ├── (auth)/
│   │   ├── login/                 page.js + LoginForm.jsx
│   │   └── register/              page.js + RegisterForm.jsx
│   ├── auth/callback/route.js     Email-confirmation handler
│   ├── dashboard/                 USER DASHBOARD (protected)
│   │   ├── layout.js              Loads profile + account, wraps Shell
│   │   ├── page.js                Home: balance card, actions, activity, cards
│   │   ├── transfer/page.js       Send money (recipient lookup + confirm)
│   │   ├── deposit/page.js        Add money
│   │   ├── withdraw/page.js       Withdraw to an external bank
│   │   ├── transactions/page.js   Activity, filters, search, receipts
│   │   ├── cards/page.js          Virtual cards: create, fund, freeze, close
│   │   ├── stats/page.js          Cash-flow chart + categories
│   │   ├── support/page.js        Support tickets
│   │   └── profile/page.js        Details, verification, password, logout
│   ├── admin/
│   │   ├── login/page.js          Admin login
│   │   └── (panel)/               ADMIN CONSOLE (admin role required)
│   │       ├── layout.js
│   │       ├── page.js            Overview
│   │       ├── users/page.js      Customers list
│   │       ├── users/[id]/page.js Customer detail + actions
│   │       ├── transactions/page.js Review queue
│   │       └── support/page.js    Ticket replies
│   └── api/                       BACKEND (route handlers)
│       ├── transfer/route.js      POST  send money
│       ├── lookup/route.js        POST  find recipient by account number
│       ├── deposit/route.js       POST  deposit request
│       ├── withdraw/route.js      POST  withdrawal request
│       ├── cards/route.js         POST  create card
│       ├── cards/[id]/route.js    PATCH freeze / unfreeze / fund / close
│       ├── notifications/route.js GET list, PATCH mark read
│       ├── support/route.js       POST  new ticket
│       ├── profile/route.js       PATCH update profile
│       └── admin/
│           ├── transactions/[id]/route.js  PATCH approve / reject
│           ├── users/[id]/route.js         PATCH status / KYC / role
│           └── tickets/[id]/route.js       PATCH reply / close
├── components/
│   ├── Preloader.jsx              Intro animation
│   ├── landing/                   Navbar, Hero, CardStack, Partners, Features, Products,
│   │                              HowItWorks, Security, Pricing, FAQ, CTA, Footer, Reveal, images.js
│   ├── dashboard/                 BankProvider (state + toasts), Shell (sidebar, top bar,
│   │                              bottom nav), BankingMenu, Modal, VirtualCard, bits, nav, useCopy
│   ├── admin/                     AdminShell, AdminToaster
│   └── ui/                        Icon (Hugeicons), Logo, AuthShell, Field, FlowChart
├── lib/
│   ├── supabase/client.js         Browser client
│   ├── supabase/server.js         Server client (cookies)
│   ├── supabase/middleware.js     Session refresh + route protection
│   ├── api.js                     Route-handler helpers (auth, admin check, errors)
│   ├── fetcher.js                 Client fetch helper
│   ├── format.js                  Money / date formatting
│   └── signout.js
├── supabase/schema.sql            Tables, RLS policies, triggers, banking + admin functions
├── scripts/create-admin.mjs       Creates the admin user
├── public/favicon.svg
├── middleware.js
├── tailwind.config.js, postcss.config.js, next.config.mjs, jsconfig.json
├── .env.example
└── package.json
```

## 4. Database (supabase/schema.sql)

| Table | Purpose |
|---|---|
| `profiles` | Name, email, role (`user`/`admin`), status (`active`/`frozen`/`suspended`), KYC status |
| `accounts` | One checking account per user, 10-digit account number, balance (never negative) |
| `transactions` | Ledger of every movement, with status `pending`/`completed`/`rejected` |
| `cards` | Virtual cards with their own balance |
| `notifications` | In-app notifications |
| `support_tickets` | Customer messages and admin replies |
| `admin_audit` | Log of admin actions |

Functions: `transfer_funds`, `lookup_account`, `request_deposit`, `request_withdrawal`, `create_card`,
`set_card_status`, `fund_card`, `admin_review_transaction`, `admin_update_user`, `admin_reply_ticket`, `admin_stats`.

## 5. Customising
- Colours: `tailwind.config.js` (`ink` = navy, `brand` = periwinkle accent)
- Brand name: search for "Novaro"
- Photos: `components/landing/images.js` (any Pexels photo ID)
- Icons: `components/ui/Icon.jsx` — add any icon from `@hugeicons/core-free-icons`

> Novaro is a demo project. Running a real bank requires a banking licence or a licensed banking partner.
