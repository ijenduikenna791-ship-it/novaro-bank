'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from '@/components/ui/Icon';
import { initials } from '@/lib/format';
import { useBank } from './BankProvider';
import { signOut } from '@/lib/signout';
import { NAV } from './nav';
import { StatusChip } from './bits';

const TONES = ['bg-brand-50 text-brand-700', 'bg-emerald-50 text-emerald-700', 'bg-amber-50 text-amber-700', 'bg-sky-50 text-sky-700'];

/** Grid menu opened from the center button (mobile) or hamburger. */
export default function BankingMenu() {
  const router = useRouter();
  const { menuOpen, setMenuOpen, profile, account } = useBank();
  const close = () => setMenuOpen(false);

  return (
    <AnimatePresence>
      {menuOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
          <motion.div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="pb-safe relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] bg-white p-5 sm:max-w-md sm:rounded-[28px]"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-ink-700 to-ink-900 text-sm font-semibold text-white">
                  {initials(profile?.full_name)}
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{profile?.full_name}</p>
                  <p className="text-xs text-slate-500">Account {account?.account_number}</p>
                  <div className="mt-1"><StatusChip status={profile?.kyc_status} /></div>
                </div>
              </div>
              <button onClick={close} className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500" aria-label="Close menu">
                <Icon name="close" size={16} />
              </button>
            </div>

            <div className="mt-6 text-center">
              <h3 className="font-display text-xl font-semibold text-slate-900">Banking menu</h3>
              <p className="text-sm text-slate-500">Select an option to continue</p>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {NAV.map((n, i) => (
                <motion.div key={n.href} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }}>
                  <Link
                    href={n.href}
                    onClick={close}
                    className={`flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl text-xs font-semibold transition active:scale-95 ${TONES[i % TONES.length]}`}
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-white/80">
                      <Icon name={n.icon} size={20} />
                    </span>
                    {n.label}
                  </Link>
                </motion.div>
              ))}
            </div>
            <button
              onClick={() => {
                close();
                signOut(router);
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 py-3.5 text-sm font-semibold text-red-600"
            >
              <Icon name="logout" size={18} /> Log out
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
