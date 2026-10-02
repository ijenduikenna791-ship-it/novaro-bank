'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { money, dateTime, txLabel } from '@/lib/format';
import Icon from '@/components/ui/Icon';
import FlowChart from '@/components/ui/FlowChart';
import { PageHeader, StatusChip, Skeleton, Empty } from '@/components/dashboard/bits';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [signups, setSignups] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const [s, p, u] = await Promise.all([
        supabase.rpc('admin_stats'),
        supabase.from('transactions').select('*, accounts!transactions_account_id_fkey(account_number, profiles(full_name, email))').eq('status', 'pending').order('created_at', { ascending: true }).limit(5),
        supabase.from('profiles').select('id, full_name, email, kyc_status, created_at').eq('role', 'user').order('created_at', { ascending: false }).limit(5),
      ]);
      if (s.error) setError(s.error.message);
      setStats(s.data);
      setPending(p.data || []);
      setSignups(u.data || []);
    })();
  }, []);

  const tiles = stats
    ? [
        { label: 'Customers', value: stats.users, sub: `${stats.active_users} active`, icon: 'users' },
        { label: 'Deposits held', value: money(stats.total_deposits), sub: 'Sum of all balances', icon: 'bank' },
        { label: 'Pending reviews', value: stats.pending, sub: 'Need action', icon: 'hourglass', href: '/admin/transactions' },
        { label: 'Open tickets', value: stats.open_tickets, sub: `${stats.cards} active cards`, icon: 'support', href: '/admin/support' },
      ]
    : [];

  return (
    <div>
      <PageHeader title="Overview" subtitle="Live numbers from your database." />
      {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats === null
          ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)
          : tiles.map((t, i) => {
              const body = (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="panel h-full p-4 transition hover:shadow-md sm:p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500 sm:text-sm">{t.label}</p>
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600"><Icon name={t.icon} size={18} /></span>
                  </div>
                  <p className="mt-3 truncate font-display text-xl font-semibold tabular-nums sm:text-2xl">{t.value}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{t.sub}</p>
                </motion.div>
              );
              return t.href ? <Link key={t.label} href={t.href}>{body}</Link> : <div key={t.label}>{body}</div>;
            })}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        <section className="panel p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">Money movement · 14 days</h2>
            {stats && <span className="text-xs text-slate-500">30-day outflow {money(stats.volume_30d)}</span>}
          </div>
          {stats ? <FlowChart data={stats.daily} /> : <Skeleton className="h-60" />}
        </section>

        <section className="panel p-2">
          <div className="flex items-center justify-between px-3 py-2">
            <h2 className="font-semibold">Review queue</h2>
            <Link href="/admin/transactions" className="text-sm font-medium text-brand-600">Open</Link>
          </div>
          {pending.length === 0 ? (
            <Empty icon="check" title="All clear" text="No transactions waiting for review." />
          ) : (
            pending.map((t) => (
              <Link key={t.id} href="/admin/transactions" className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-slate-50">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-amber-50 text-amber-600"><Icon name="hourglass" size={18} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{t.accounts?.profiles?.full_name}</span>
                  <span className="block text-xs text-slate-500">{txLabel[t.type]} · {dateTime(t.created_at)}</span>
                </span>
                <span className="text-sm font-semibold tabular-nums">{money(t.amount)}</span>
              </Link>
            ))
          )}
        </section>
      </div>

      <section className="panel mt-4 p-2">
        <div className="flex items-center justify-between px-3 py-2">
          <h2 className="font-semibold">Newest customers</h2>
          <Link href="/admin/users" className="text-sm font-medium text-brand-600">All customers</Link>
        </div>
        {signups.map((u) => (
          <Link key={u.id} href={`/admin/users/${u.id}`} className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-slate-50">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-ink-900 text-xs font-semibold text-white">{u.full_name?.[0]?.toUpperCase()}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{u.full_name}</span>
              <span className="block truncate text-xs text-slate-500">{u.email}</span>
            </span>
            <StatusChip status={u.kyc_status} />
          </Link>
        ))}
      </section>
    </div>
  );
}
