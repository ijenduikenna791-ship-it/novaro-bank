'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { money, greeting } from '@/lib/format';
import Icon from '@/components/ui/Icon';
import { LogoMark } from '@/components/ui/Logo';
import { useBank } from '@/components/dashboard/BankProvider';
import { useCopy } from '@/components/dashboard/useCopy';
import Modal from '@/components/dashboard/Modal';
import VirtualCard from '@/components/dashboard/VirtualCard';
import { TxRow, TxReceipt, StatusChip, Empty, Skeleton } from '@/components/dashboard/bits';

function Clock() {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!now) return <div className="h-10" />;
  return (
    <div className="text-right">
      <p className="font-display text-lg font-medium tabular-nums sm:text-xl">{now.toLocaleTimeString('en-GB')}</p>
      <p className="text-[11px] text-white/60">{now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>
  );
}

const ACTIONS = [
  { href: '/dashboard/transfer', label: 'Transfer', text: 'Send to any Novaro account', icon: 'send', tone: 'from-brand-50 to-white text-brand-600' },
  { href: '/dashboard/deposit', label: 'Add money', text: 'Wire, ACH or check', icon: 'download', tone: 'from-emerald-50 to-white text-emerald-600' },
  { href: '/dashboard/withdraw', label: 'Withdraw', text: 'To your external bank', icon: 'upload', tone: 'from-amber-50 to-white text-amber-600' },
  { href: '/dashboard/cards', label: 'Cards', text: 'Create and manage cards', icon: 'card', tone: 'from-sky-50 to-white text-sky-600' },
  { href: '/dashboard/transactions', label: 'History', text: 'All your transactions', icon: 'clock', tone: 'from-violet-50 to-white text-violet-600' },
  { href: '/dashboard/support', label: 'Support', text: 'We reply fast', icon: 'support', tone: 'from-rose-50 to-white text-rose-600' },
];

export default function DashboardHome() {
  const { profile, account, hidden, toggleHidden } = useBank();
  const copy = useCopy();
  const [txs, setTxs] = useState(null);
  const [cards, setCards] = useState([]);
  const [pending, setPending] = useState(0);
  const [receipt, setReceipt] = useState(null);
  const [receive, setReceive] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const [{ data: t }, { data: c }, { count }] = await Promise.all([
        supabase.from('transactions').select('*').eq('account_id', account.id).order('created_at', { ascending: false }).limit(6),
        supabase.from('cards').select('*').eq('user_id', profile.id).neq('status', 'terminated').order('created_at', { ascending: false }),
        supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('account_id', account.id).eq('status', 'pending'),
      ]);
      setTxs(t || []);
      setCards(c || []);
      setPending(count || 0);
    })();
  }, [account.id, account.balance, profile.id]);

  const cardTotal = cards.reduce((s, c) => s + Number(c.balance), 0);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_1fr]">
      <div className="space-y-6">
        {/* Balance card */}
        <motion.section
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#26336b] via-[#141e44] to-[#0a1022] p-5 text-white shadow-[0_24px_50px_-20px_rgba(10,16,34,.8)] sm:p-7"
        >
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-400/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full border border-white/10" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/5"><LogoMark className="h-5 w-8" /></span>
              <div>
                <p className="text-xs text-white/60">{greeting()}</p>
                <p className="font-medium">{profile.full_name?.split(' ')[0]}</p>
              </div>
            </div>
            <Clock />
          </div>

          <div className="relative mt-7">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/70">Available balance</p>
              <button onClick={toggleHidden} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10" aria-label="Toggle balance">
                <Icon name={hidden ? 'eye' : 'eyeOff'} size={19} />
              </button>
            </div>
            <motion.p key={hidden ? 'h' : account.balance} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
              {hidden ? '$ ••••••' : money(account.balance)}
            </motion.p>
            <p className="mt-1 text-xs text-white/50">{account.currency} · Checking account</p>
          </div>

          <div className="relative mt-6 grid grid-cols-3 gap-2.5 sm:gap-3">
            {[
              { label: 'Receive', icon: 'qr', onClick: () => setReceive(true) },
              { label: 'Send', icon: 'send', href: '/dashboard/transfer' },
              { label: 'Add money', icon: 'plus', href: '/dashboard/deposit' },
            ].map((a) => {
              const inner = (
                <>
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-white/15"><Icon name={a.icon} size={19} /></span>
                  <span className="text-xs font-medium sm:text-sm">{a.label}</span>
                </>
              );
              const cls = 'flex flex-col items-center gap-2 rounded-2xl bg-white/[0.08] py-4 transition hover:bg-white/[0.14] active:scale-95';
              return a.href ? (
                <Link key={a.label} href={a.href} className={cls}>{inner}</Link>
              ) : (
                <button key={a.label} onClick={a.onClick} className={cls}>{inner}</button>
              );
            })}
          </div>

          <div className="relative mt-3 flex items-center gap-3 rounded-2xl bg-white/[0.06] p-3.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10"><Icon name="shield" size={19} /></span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-white/60">Your account number</p>
              <div className="flex items-center gap-2">
                <p className="font-display text-base tracking-wider">{account.account_number}</p>
                <span className="chip bg-emerald-400/15 text-emerald-300">{profile.status}</span>
              </div>
            </div>
            <button onClick={() => copy(account.account_number, 'Account number copied')} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Copy account number">
              <Icon name="copy" size={17} />
            </button>
          </div>
        </motion.section>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="panel flex items-center gap-3 p-4">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-amber-600"><Icon name="hourglass" size={20} /></span>
            <div><p className="text-xs text-slate-500">Pending</p><p className="font-display text-xl font-semibold">{pending}</p></div>
          </div>
          <div className="panel flex items-center gap-3 p-4">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><Icon name="wallet" size={20} /></span>
            <div className="min-w-0"><p className="text-xs text-slate-500">Card balance</p><p className="truncate font-display text-lg font-semibold sm:text-xl">{hidden ? '••••' : money(cardTotal)}</p></div>
          </div>
        </div>

        {/* Actions */}
        <section className="panel p-5">
          <h2 className="font-display text-lg font-semibold">What would you like to do today?</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ACTIONS.map((a, i) => (
              <motion.div key={a.href} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i + 0.2 }}>
                <Link href={a.href} className={`flex h-full flex-col gap-3 rounded-2xl border border-slate-100 bg-gradient-to-br p-4 transition hover:-translate-y-0.5 hover:shadow-soft active:scale-[.98] ${a.tone}`}>
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white shadow-sm"><Icon name={a.icon} size={20} /></span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">{a.label}</span>
                    <span className="block text-xs text-slate-500">{a.text}</span>
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      <div className="space-y-6">
        {/* Recent */}
        <section className="panel p-3 sm:p-4">
          <div className="flex items-center justify-between px-2 pb-1 pt-1">
            <h2 className="font-display text-lg font-semibold">Recent activity</h2>
            <Link href="/dashboard/transactions" className="flex items-center gap-1 text-sm font-medium text-brand-600">View all <Icon name="right" size={15} /></Link>
          </div>
          {txs === null ? (
            <div className="space-y-3 p-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : txs.length === 0 ? (
            <Empty title="No transactions yet" text="Add money to get started." action={<Link href="/dashboard/deposit" className="btn-dark">Add money</Link>} />
          ) : (
            txs.map((t) => <TxRow key={t.id} tx={t} hidden={hidden} onClick={() => setReceipt(t)} />)
          )}
        </section>

        {/* Cards */}
        <section className="panel p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><Icon name="card" size={20} /> Your cards</h2>
            <Link href="/dashboard/cards" className="flex items-center gap-1 text-sm font-medium text-brand-600">View all <Icon name="right" size={15} /></Link>
          </div>
          {cards[0] ? (
            <div className="mt-4">
              <VirtualCard card={cards[0]} />
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-slate-500">{cards[0].label}</span>
                <span className="font-semibold">{hidden ? '••••' : money(cards[0].balance)}</span>
              </div>
            </div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[#26336b] to-[#0a1022] p-5 text-white">
              <h3 className="font-display text-lg font-semibold">Virtual cards made easy</h3>
              <p className="mt-1 text-sm text-white/70">Create a card for safe online payments and subscriptions. Freeze it any time.</p>
              <ul className="mt-4 space-y-2 text-sm text-white/85">
                {[['shield', 'Keeps your main account separate'], ['globe', 'Accepted online worldwide'], ['flash', 'Ready in seconds']].map(([ic, t]) => (
                  <li key={t} className="flex items-center gap-2"><Icon name={ic} size={16} /> {t}</li>
                ))}
              </ul>
              <Link href="/dashboard/cards" className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink-900">
                Create a card <Icon name="right" size={15} />
              </Link>
            </div>
          )}
        </section>
      </div>

      <Modal open={!!receipt} onClose={() => setReceipt(null)} title="Transaction details">
        <TxReceipt tx={receipt} />
      </Modal>

      <Modal open={receive} onClose={() => setReceive(false)} title="Receive money">
        <div className="rounded-2xl bg-slate-50 p-5 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-600"><Icon name="bank" size={26} /></span>
          <p className="mt-3 text-sm text-slate-500">Share these details to get paid by another Novaro customer.</p>
        </div>
        <dl className="mt-4 divide-y divide-slate-100">
          {[
            ['Account name', profile.full_name],
            ['Account number', account.account_number],
            ['Account type', 'Checking'],
            ['Currency', account.currency],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-3 text-sm">
              <dt className="text-slate-500">{k}</dt>
              <dd className="flex items-center gap-2 font-medium">
                {v}
                {k === 'Account number' && (
                  <button onClick={() => copy(v, 'Account number copied')} className="text-brand-600" aria-label="Copy"><Icon name="copy" size={16} /></button>
                )}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-2 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
          <span className="text-slate-500">Verification</span>
          <StatusChip status={profile.kyc_status} />
        </div>
        <button onClick={() => copy(`${profile.full_name}\nNovaro account: ${account.account_number}`, 'Details copied')} className="btn-dark mt-4 w-full">
          <Icon name="copy" size={17} /> Copy all details
        </button>
      </Modal>
    </div>
  );
}
