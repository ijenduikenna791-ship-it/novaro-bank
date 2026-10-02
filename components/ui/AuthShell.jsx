'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Logo from '@/components/ui/Logo';

export default function AuthShell({ title, subtitle, children, image, badge }) {
  return (
    <div className="hero-bg flex min-h-[100dvh]">
      <div className="flex w-full flex-col px-5 py-6 sm:px-10 lg:w-1/2">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm"
          >
            {badge}
            <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">{title}</h1>
            <p className="mt-2 text-sm text-ink-200/70">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </motion.div>
        </div>
      </div>
      <div className="relative hidden w-1/2 p-4 lg:block">
        <div className="relative h-full overflow-hidden rounded-[32px] border border-white/10">
          <Image src={image} alt="" fill sizes="50vw" className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-900/30 to-transparent" />
          <div className="absolute bottom-10 left-10 right-10">
            <p className="font-display text-3xl font-medium leading-tight">Banking made simple, secure, and smart.</p>
            <p className="mt-2 text-sm text-ink-100/70">Send money, manage cards and track spending from one place.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
