'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/components/ui/Logo';
import Icon from '@/components/ui/Icon';

const LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Products', href: '#products' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
  { label: 'Resources', href: '#faq' },
];

export default function Navbar({ ready }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={ready ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-ink-950/70 backdrop-blur-xl' : ''}`}
    >
      <nav className="container-x flex h-16 items-center justify-between sm:h-20">
        <Logo />
        <ul className="glass hidden items-center gap-1 rounded-full px-2 py-1.5 md:flex">
          {LINKS.map((l) => (
            <li key={l.label}>
              <a href={l.href} className="rounded-full px-3.5 py-1.5 text-[13px] text-ink-100/85 transition hover:bg-white/10 hover:text-white">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <Link href="/login" className="glass hidden items-center gap-1.5 rounded-full px-4 py-2 text-[13px] text-white transition hover:bg-white/10 sm:inline-flex">
            <Icon name="sparkles" size={14} /> Login
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="glass grid h-10 w-10 place-items-center rounded-full md:hidden"
            aria-label="Toggle menu"
          >
            <Icon name={open ? 'close' : 'menu'} size={18} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="container-x pb-4 md:hidden"
          >
            <div className="glass rounded-3xl bg-ink-900/80 p-3">
              {LINKS.map((l, i) => (
                <motion.a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between rounded-2xl px-4 py-3 text-ink-100 hover:bg-white/5"
                >
                  {l.label} <Icon name="right" size={16} className="opacity-50" />
                </motion.a>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link href="/login" className="rounded-2xl border border-white/10 py-3 text-center text-sm">Login</Link>
                <Link href="/register" className="rounded-2xl bg-white py-3 text-center text-sm font-semibold text-ink-900">Open account</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
