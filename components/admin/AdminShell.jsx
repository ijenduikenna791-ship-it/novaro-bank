'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { signOut } from '@/lib/signout';
import { initials } from '@/lib/format';
import Icon from '@/components/ui/Icon';
import { LogoMark } from '@/components/ui/Logo';

const NAV = [
  { href: '/admin', label: 'Overview', icon: 'dashboard' },
  { href: '/admin/users', label: 'Customers', icon: 'users' },
  { href: '/admin/transactions', label: 'Transactions', icon: 'transfer' },
  { href: '/admin/support', label: 'Support', icon: 'support' },
];

function NavLinks({ onNavigate }) {
  const path = usePathname();
  return (
    <nav className="space-y-1">
      {NAV.map((n) => {
        const active = n.href === '/admin' ? path === n.href : path.startsWith(n.href);
        return (
          <Link key={n.href} href={n.href} onClick={onNavigate} className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? 'text-white' : 'text-ink-200/70 hover:bg-white/5 hover:text-white'}`}>
            {active && <motion.span layoutId="admin-active" className="absolute inset-0 rounded-xl bg-white/10" />}
            <Icon name={n.icon} size={19} className="relative" />
            <span className="relative">{n.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminShell({ admin, children }) {
  const router = useRouter();
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const side = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-2">
        <LogoMark />
        <div>
          <p className="font-display font-semibold leading-none text-white">Novaro</p>
          <p className="text-[11px] text-ink-200/60">Admin console</p>
        </div>
      </div>
      <div className="mt-8 flex-1"><NavLinks onNavigate={() => setOpen(false)} /></div>
      <Link href="/dashboard" className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-200/70 hover:bg-white/5 hover:text-white">
        <Icon name="home" size={19} /> My account
      </Link>
      <button onClick={() => signOut(router, '/admin/login')} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-300 hover:bg-red-500/10">
        <Icon name="logout" size={19} /> Log out
      </button>
    </div>
  );

  return (
    <div className="flex min-h-[100dvh] bg-canvas text-slate-900">
      <aside className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 bg-ink-900 px-4 py-6 lg:block">{side}</aside>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div className="absolute inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="absolute inset-y-0 left-0 w-72 bg-ink-900 px-4 py-6">
              {side}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/70 bg-white/85 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-2">
            <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-slate-100 lg:hidden" aria-label="Open menu"><Icon name="menu" size={21} /></button>
            <span className="chip bg-ink-900 text-white"><Icon name="shieldCheck" size={12} /> Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{admin.full_name}</p>
              <p className="text-xs text-slate-500">{admin.email}</p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-ink-900 text-xs font-semibold text-white">{initials(admin.full_name)}</span>
          </div>
        </header>
        <motion.main key={path} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          {children}
        </motion.main>
      </div>
    </div>
  );
}
