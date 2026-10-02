'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { signOut } from '@/lib/signout';
import { api } from '@/lib/fetcher';
import { initials, dateTime } from '@/lib/format';
import Icon from '@/components/ui/Icon';
import { LogoMark } from '@/components/ui/Logo';
import { useBank } from './BankProvider';
import BankingMenu from './BankingMenu';
import { NAV } from './nav';

function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const { profile } = useBank();
  return (
    <aside className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 flex-col border-r border-slate-200/70 bg-white px-4 py-6 lg:flex">
      <Link href="/dashboard" className="flex items-center gap-2 px-2">
        <LogoMark />
        <span className="font-display text-lg font-semibold text-ink-900">Novaro</span>
      </Link>
      <nav className="mt-8 flex-1 space-y-1">
        {NAV.map((n) => {
          const active = n.href === '/dashboard' ? path === n.href : path.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? 'text-ink-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {active && <motion.span layoutId="side-active" className="absolute inset-0 rounded-xl bg-brand-50" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
              <Icon name={n.icon} size={19} className="relative" />
              <span className="relative">{n.label}</span>
            </Link>
          );
        })}
        {profile?.role === 'admin' && (
          <Link href="/admin" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50">
            <Icon name="dashboard" size={19} /> Admin console
          </Link>
        )}
      </nav>
      <button onClick={() => signOut(router)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
        <Icon name="logout" size={19} /> Log out
      </button>
    </aside>
  );
}

function Notifications() {
  const { notifications, setNotifications } = useBank();
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  const toggle = async () => {
    setOpen((o) => !o);
    if (!open && unread) {
      setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
      api('/api/notifications', { method: 'PATCH' }).catch(() => {});
    }
  };

  const dot = { success: 'bg-emerald-500', warning: 'bg-amber-500', error: 'bg-red-500', info: 'bg-brand-500' };

  return (
    <div className="relative">
      <button onClick={toggle} className="relative grid h-10 w-10 place-items-center rounded-full text-slate-700 hover:bg-slate-100" aria-label="Notifications">
        <Icon name="bell" size={21} />
        {unread > 0 && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              className="fixed left-3 right-3 top-16 z-50 max-h-[70dvh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-96"
            >
              <p className="px-3 py-2 text-sm font-semibold text-slate-900">Notifications</p>
              {notifications.length === 0 && <p className="px-3 py-6 text-center text-sm text-slate-500">You are all caught up.</p>}
              {notifications.map((n) => (
                <div key={n.id} className="flex gap-3 rounded-xl px-3 py-3 hover:bg-slate-50">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot[n.kind] || dot.info}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">{n.title}</p>
                    {n.body && <p className="text-xs text-slate-500">{n.body}</p>}
                    <p className="mt-1 text-[11px] text-slate-400">{dateTime(n.created_at)}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Topbar() {
  const { profile, setMenuOpen } = useBank();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <button onClick={() => setMenuOpen(true)} className="grid h-10 w-10 place-items-center rounded-full text-slate-700 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
            <Icon name="menu" size={21} />
          </button>
          <Link href="/dashboard" className="lg:hidden"><LogoMark /></Link>
          <p className="hidden text-sm text-slate-500 lg:block">
            Welcome back, <span className="font-semibold text-slate-900">{profile?.full_name?.split(' ')[0]}</span>
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Notifications />
          <Link href="/dashboard/profile" className="ml-1 grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-ink-700 to-ink-900 text-xs font-semibold text-white ring-2 ring-brand-100">
            {initials(profile?.full_name)}
          </Link>
        </div>
      </div>
    </header>
  );
}

function BottomNav() {
  const path = usePathname();
  const { setMenuOpen } = useBank();
  const items = [NAV[0], NAV[4], null, NAV[3], NAV[8]];
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/70 bg-white/95 backdrop-blur-xl lg:hidden">
      <div className="relative mx-auto grid max-w-md grid-cols-5 items-end px-2 pt-2">
        {items.map((n, i) =>
          n ? (
            <Link key={n.href} href={n.href} className={`flex flex-col items-center gap-1 py-1 text-[11px] font-medium transition ${(n.href === '/dashboard' ? path === n.href : path.startsWith(n.href)) ? 'text-ink-900' : 'text-slate-400'}`}>
              <Icon name={n.icon} size={22} />
              {n.label}
            </Link>
          ) : (
            <div key={i} className="flex justify-center">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setMenuOpen(true)}
                className="-mt-8 grid h-14 w-14 place-items-center rounded-full bg-ink-900 text-white shadow-[0_10px_25px_-5px_rgba(10,16,34,.5)] ring-4 ring-white"
                aria-label="Banking menu"
              >
                <Icon name="grid" size={24} />
              </motion.button>
            </div>
          )
        )}
      </div>
    </nav>
  );
}

export default function Shell({ children }) {
  const path = usePathname();
  return (
    <div className="flex min-h-[100dvh] bg-canvas text-slate-900">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Topbar />
        <motion.main
          key={path}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-6xl px-4 pb-32 pt-5 sm:px-6 lg:pb-12 lg:pt-8"
        >
          {children}
        </motion.main>
      </div>
      <BottomNav />
      <BankingMenu />
    </div>
  );
}
