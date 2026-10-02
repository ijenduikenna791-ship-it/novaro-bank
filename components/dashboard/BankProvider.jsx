'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/Icon';

const BankCtx = createContext(null);
export const useBank = () => useContext(BankCtx);

export default function BankProvider({ initial, children }) {
  const [profile, setProfile] = useState(initial.profile);
  const [account, setAccount] = useState(initial.account);
  const [notifications, setNotifications] = useState([]);
  const [hidden, setHidden] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    try {
      setHidden(localStorage.getItem('nv-hide-balance') === '1');
    } catch {}
  }, []);

  const toggleHidden = () =>
    setHidden((h) => {
      try {
        localStorage.setItem('nv-hide-balance', h ? '0' : '1');
      } catch {}
      return !h;
    });

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const [{ data: p }, { data: a }, { data: n }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', initial.profile.id).single(),
      supabase.from('accounts').select('*').eq('user_id', initial.profile.id).single(),
      supabase.from('notifications').select('*').eq('user_id', initial.profile.id).order('created_at', { ascending: false }).limit(30),
    ]);
    if (p) setProfile(p);
    if (a) setAccount(a);
    if (n) setNotifications(n);
  }, [initial.profile.id]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30000);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh]);

  const toast = useCallback((message, kind = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  return (
    <BankCtx.Provider value={{ profile, account, notifications, setNotifications, hidden, toggleHidden, refresh, toast, menuOpen, setMenuOpen }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[90] flex flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              className={`pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-xl ${
                t.kind === 'error' ? 'bg-red-600' : 'bg-ink-900'
              }`}
            >
              <Icon name={t.kind === 'error' ? 'alert' : 'check'} size={18} />
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </BankCtx.Provider>
  );
}
