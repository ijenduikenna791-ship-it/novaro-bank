'use client';
import { motion } from 'framer-motion';

function Chip() {
  return (
    <div className="relative h-7 w-9 overflow-hidden rounded-md bg-gradient-to-br from-[#f3d9a8] via-[#e2b877] to-[#c99a55]">
      <div className="absolute inset-x-0 top-1/2 h-px bg-black/25" />
      <div className="absolute inset-y-0 left-1/3 w-px bg-black/25" />
      <div className="absolute inset-y-0 right-1/3 w-px bg-black/25" />
      <div className="absolute left-1/3 right-1/3 top-1/4 bottom-1/4 rounded-sm border border-black/25" />
    </div>
  );
}

function Network() {
  return (
    <div className="flex -space-x-2.5" aria-hidden="true">
      <span className="h-6 w-6 rounded-full bg-white/80" />
      <span className="h-6 w-6 rounded-full bg-white/40 mix-blend-screen" />
    </div>
  );
}

function BankCard({ variant, number = '•••• •••• •••• 3507' }) {
  const glass = variant === 'glass';
  return (
    <div
      className={`relative h-[200px] w-[320px] overflow-hidden rounded-[22px] p-5 sm:h-[220px] sm:w-[350px] ${
        glass
          ? 'border border-white/30 bg-gradient-to-br from-white/45 via-white/25 to-white/[0.12] shadow-[0_30px_60px_-20px_rgba(0,0,0,.6)] backdrop-blur-md'
          : 'border border-white/10 bg-gradient-to-br from-[#1a2549] via-[#0f1734] to-[#070c1c] shadow-[0_30px_50px_-20px_rgba(0,0,0,.8)]'
      }`}
    >
      {glass && <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/20 blur-2xl" />}
      <div className="relative flex items-start justify-between">
        <span className="font-display text-sm font-medium text-white/90">Novaro</span>
        <Network />
      </div>
      <p className="relative mt-7 font-display text-[22px] tracking-[0.12em] text-white sm:text-2xl">{number}</p>
      <div className="relative mt-5 flex items-end justify-between">
        <div className="flex gap-6 text-[10px] uppercase tracking-wider text-white/55">
          <div>
            Card holder<p className="mt-0.5 text-xs normal-case tracking-normal text-white/90">Jade William</p>
          </div>
          <div>
            Expiry<p className="mt-0.5 text-xs tracking-normal text-white/90">02/30</p>
          </div>
        </div>
        <Chip />
      </div>
    </div>
  );
}

/** Isometric stack of three cards, animated in and floating. */
export default function CardStack({ ready }) {
  const layers = [
    { variant: 'dark', z: 0, delay: 0.25, number: '•••• •••• •••• 8841' },
    { variant: 'dark', z: 60, delay: 0.4, number: '•••• •••• •••• 2290' },
    { variant: 'glass', z: 120, delay: 0.55, number: '3455 4562 7710 3507' },
  ];
  return (
    <div className="relative mx-auto h-[300px] w-full max-w-[560px] [perspective:1800px] sm:h-[440px]">
      {/* static isometric plane (CSS), so the tilt never depends on JS */}
      <div className="absolute left-1/2 top-[46%] h-0 w-0 scale-[0.78] [transform-style:preserve-3d] sm:scale-100">
        <div className="[transform-style:preserve-3d]" style={{ transform: 'rotateX(56deg) rotateZ(-34deg)' }}>
        <div className="animate-float [transform-style:preserve-3d]">
          {layers.map((l, i) => (
            <div
              key={i}
              className="absolute left-0 top-0 [transform-style:preserve-3d]"
              style={{ transform: `translate(-50%, -50%) translateZ(${l.z}px)` }}
            >
              <motion.div
                initial={{ opacity: 0, y: 120 }}
                animate={ready ? { opacity: 1, y: 0 } : {}}
                whileHover={{ y: -18 }}
                transition={{ duration: 1.1, delay: l.delay, ease: [0.22, 1, 0.36, 1] }}
              >
                <BankCard variant={l.variant} number={l.number} />
              </motion.div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
