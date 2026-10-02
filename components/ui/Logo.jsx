import Link from 'next/link';

export function LogoMark({ className = 'h-7 w-11' }) {
  return (
    <svg viewBox="0 0 44 28" className={className} fill="none" aria-hidden="true">
      <rect x="0.5" y="0.5" width="43" height="27" rx="13.5" fill="#0a1022" stroke="rgba(255,255,255,.18)" />
      <path d="M13 19V9l9 10V9" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="30" cy="14" r="5" stroke="#9eabf5" strokeWidth="2.4" />
    </svg>
  );
}

export default function Logo({ href = '/', dark = true, className = '' }) {
  return (
    <Link href={href} className={`inline-flex items-center gap-2 ${className}`} aria-label="Novaro home">
      <LogoMark />
      <span className={`font-display text-[17px] font-semibold tracking-tight ${dark ? 'text-white' : 'text-ink-900'}`}>Novaro</span>
    </Link>
  );
}
