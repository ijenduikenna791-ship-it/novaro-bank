'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Icon from '@/components/ui/Icon';
import CardStack from './CardStack';
import { avatars } from './images';

const ease = [0.22, 1, 0.36, 1];

export default function Hero({ ready }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const up = (d) => ({
    initial: { opacity: 0, y: 30 },
    animate: ready ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.9, delay: d, ease },
  });

  const submit = (e) => {
    e.preventDefault();
    router.push(`/register${email ? `?email=${encodeURIComponent(email)}` : ''}`);
  };

  return (
    <section className="hero-bg relative overflow-hidden pb-16 pt-28 sm:pb-24 sm:pt-36">
      {/* concentric arcs */}
      <div className="pointer-events-none absolute left-1/2 top-[55%] -translate-x-1/2">
        {[500, 760, 1020, 1280].map((s) => (
          <div
            key={s}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.05]"
            style={{ width: s, height: s }}
          />
        ))}
      </div>

      <div className="container-x relative grid grid-cols-1 items-center gap-6 lg:gap-10 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <motion.span {...up(0)} className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] text-ink-100/80">
            <Icon name="shieldCheck" size={13} /> 256-bit Encryption
          </motion.span>

          <h1 className="mt-5 font-display text-[40px] font-medium leading-[1.04] tracking-[-0.035em] sm:text-6xl lg:text-[54px] xl:text-[64px]">
            {['Banking Made Simple,', 'Secure, and Smart'].map((line, i) => (
              <span key={i} className="block overflow-hidden pb-1 lg:whitespace-nowrap">
                <motion.span
                  className="text-gradient block"
                  initial={{ y: '105%' }}
                  animate={ready ? { y: 0 } : {}}
                  transition={{ duration: 1, delay: 0.1 + i * 0.12, ease }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p {...up(0.35)} className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-100/75">
            Open your digital bank account in minutes. Manage your money with confidence, enjoy zero hidden fees,
            and grow your wealth effortlessly.
          </motion.p>

          <motion.form
            {...up(0.45)}
            onSubmit={submit}
            className="glass mt-7 flex w-full max-w-md items-center gap-2 rounded-full p-1.5 pl-5"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-ink-200/50"
            />
            <button type="submit" className="btn-light shrink-0 whitespace-nowrap">
              Get Started
              <span className="grid h-8 w-8 place-items-center rounded-full bg-ink-900 text-white">
                <Icon name="upRight" size={15} />
              </span>
            </button>
          </motion.form>

          <motion.div {...up(0.6)} className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-3">
              {avatars.map((src, i) => (
                <div key={i} className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-[#16204a]">
                  <Image src={src} alt="" fill sizes="40px" className="object-cover" />
                </div>
              ))}
            </div>
            <div>
              <p className="font-display text-2xl font-medium leading-none">12 Million+</p>
              <p className="mt-1 max-w-[230px] text-[11px] leading-snug text-ink-200/70">
                People around the world use digital banks like ours every day.
              </p>
            </div>
          </motion.div>
        </div>

        <CardStack ready={ready} />
      </div>
    </section>
  );
}
