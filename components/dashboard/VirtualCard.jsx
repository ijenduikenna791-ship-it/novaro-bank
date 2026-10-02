'use client';
import { groupCard } from '@/lib/format';

export const THEMES = {
  midnight: 'from-[#1d2a5c] via-[#121b3d] to-[#070c1c]',
  ocean: 'from-[#2c5bd8] via-[#2443a8] to-[#14266b]',
  aurora: 'from-[#4b3fb8] via-[#2a4e9c] to-[#0d7a74]',
  graphite: 'from-[#3d4250] via-[#22252e] to-[#0f1015]',
};

export default function VirtualCard({ card, reveal = false, className = '' }) {
  const frozen = card.status === 'frozen';
  const number = reveal ? groupCard(card.card_number) : `•••• •••• •••• ${card.card_number.slice(-4)}`;
  return (
    <div
      className={`relative aspect-[1.586/1] w-full overflow-hidden rounded-[22px] bg-gradient-to-br p-5 text-white shadow-[0_20px_40px_-18px_rgba(10,16,34,.7)] ${THEMES[card.theme] || THEMES.midnight} ${className}`}
    >
      <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full border border-white/10" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="font-display text-sm font-semibold">Novaro</p>
          <p className="text-[10px] uppercase tracking-wider text-white/60">{card.label}</p>
        </div>
        <div className="flex -space-x-2.5">
          <span className="h-6 w-6 rounded-full bg-white/85" />
          <span className="h-6 w-6 rounded-full bg-white/40" />
        </div>
      </div>
      <p className="relative mt-[9%] font-display text-lg tracking-[0.12em] sm:text-xl">{number}</p>
      <div className="relative mt-[5%] flex items-end justify-between text-[10px] uppercase tracking-wider text-white/60">
        <div>
          Card holder
          <p className="mt-0.5 text-xs normal-case tracking-normal text-white">{card.holder_name}</p>
        </div>
        <div className="text-right">
          Valid thru
          <p className="mt-0.5 text-xs tracking-normal text-white">
            {String(card.expiry_month).padStart(2, '0')}/{String(card.expiry_year).slice(-2)}
          </p>
        </div>
        {reveal && (
          <div className="text-right">
            CVV<p className="mt-0.5 text-xs tracking-normal text-white">{card.cvv}</p>
          </div>
        )}
      </div>
      {frozen && (
        <div className="absolute inset-0 grid place-items-center bg-sky-200/20 backdrop-blur-[3px]">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-sky-700">Frozen</span>
        </div>
      )}
    </div>
  );
}
