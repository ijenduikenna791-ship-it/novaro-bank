import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="hero-bg grid min-h-[100dvh] place-items-center px-6 text-center">
      <div>
        <p className="font-display text-8xl font-medium text-white/90">404</p>
        <p className="mt-3 text-ink-200/70">This page doesn&apos;t exist.</p>
        <Link href="/" className="mt-8 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink-900">Back home</Link>
      </div>
    </div>
  );
}
