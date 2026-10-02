'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/Icon';
import Reveal from './Reveal';

const QA = [
  { q: 'How long does it take to open an account?', a: 'About two minutes. Sign up with your email and your account number is created straight away.' },
  { q: 'Are there any monthly fees?', a: 'The Basic plan is free. Paid plans add more cards and higher limits, and you can cancel at any time.' },
  { q: 'How do I add money?', a: 'From your dashboard choose Add money and follow the wire or ACH instructions. Funds appear once they arrive.' },
  { q: 'What happens if I lose my card?', a: 'Open Cards in your dashboard and freeze it. You can unfreeze it later or close it and create a new one.' },
  { q: 'Why is my large transfer pending?', a: 'Transfers above $10,000 are reviewed by our team before release. The funds are held safely in the meantime.' },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="bg-[#0b1226] py-24">
      <div className="container-x grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <span className="text-xs uppercase tracking-[0.25em] text-brand-300">Resources</span>
          <h2 className="mt-3 font-display text-4xl font-medium tracking-tight sm:text-5xl">Questions, answered</h2>
          <p className="mt-4 max-w-sm text-ink-200/70">Can&apos;t find what you need? Our support team replies from inside your dashboard.</p>
        </Reveal>
        <div className="space-y-3">
          {QA.map((item, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03]">
                <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
                  <span className="font-medium">{item.q}</span>
                  <motion.span animate={{ rotate: open === i ? 45 : 0 }} className="glass grid h-8 w-8 shrink-0 place-items-center rounded-full">
                    <Icon name="plus" size={16} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-ink-200/75">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
