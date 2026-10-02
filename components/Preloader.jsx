'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WORD = 'NOVARO';

/** Full-screen intro shown before the landing page. */
export default function Preloader({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    const start = performance.now();
    const duration = 2200;
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(Math.round(eased * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setVisible(false), 350);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <AnimatePresence
      onExitComplete={() => {
        document.documentElement.style.overflow = '';
        onDone?.();
      }}
    >
      {visible && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-ink-950"
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          initial={{ clipPath: 'inset(0 0 0% 0)' }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* glow */}
          <motion.div
            className="pointer-events-none absolute h-[520px] w-[520px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(98,118,196,.45) 0%, rgba(98,118,196,0) 65%)' }}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
          />
          {/* orbit rings */}
          {[180, 280, 380].map((s, i) => (
            <motion.div
              key={s}
              className="pointer-events-none absolute rounded-full border border-white/[0.06]"
              style={{ width: s, height: s }}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, rotate: i % 2 ? -90 : 90 }}
              transition={{ duration: 2, delay: 0.1 * i, ease: 'easeOut' }}
            >
              <span className="absolute -top-[3px] left-1/2 h-1.5 w-1.5 rounded-full bg-brand-300 shadow-[0_0_12px_2px_rgba(158,171,245,.8)]" />
            </motion.div>
          ))}

          {/* logo mark drawing */}
          <svg viewBox="0 0 88 56" className="relative h-14 w-[88px]" fill="none">
            <motion.rect
              x="1" y="1" width="86" height="54" rx="27" stroke="rgba(255,255,255,.35)" strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: 'easeInOut' }}
            />
            <motion.path
              d="M26 38V18l18 20V18" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, delay: 0.35, ease: 'easeInOut' }}
            />
            <motion.circle
              cx="60" cy="28" r="10" stroke="#9eabf5" strokeWidth="4"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.7, ease: 'easeInOut' }}
            />
          </svg>

          {/* wordmark */}
          <div className="relative mt-6 flex overflow-hidden font-display text-2xl font-medium tracking-[0.5em] text-white sm:text-3xl">
            {WORD.split('').map((l, i) => (
              <motion.span
                key={i}
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              >
                {l}
              </motion.span>
            ))}
          </div>
          <motion.p
            className="relative mt-3 text-xs uppercase tracking-[0.3em] text-ink-200/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            Secure digital banking
          </motion.p>

          {/* progress */}
          <div className="absolute inset-x-6 bottom-10 sm:inset-x-12">
            <div className="mb-3 flex items-end justify-between text-ink-200/80">
              <span className="text-[11px] uppercase tracking-[0.25em]">Loading</span>
              <span className="font-display text-4xl font-medium tabular-nums text-white sm:text-6xl">{progress}%</span>
            </div>
            <div className="h-px w-full overflow-hidden bg-white/10">
              <div className="h-full bg-gradient-to-r from-brand-400 to-white transition-[width] duration-75" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
