import Link from 'next/link';
import Logo from '@/components/ui/Logo';

const COLS = [
  { title: 'Product', links: [['Features', '#features'], ['Products', '#products'], ['Pricing', '#pricing']] },
  { title: 'Company', links: [['About', '#about'], ['Resources', '#faq'], ['Support', '/dashboard/support']] },
  { title: 'Account', links: [['Open account', '/register'], ['Login', '/login'], ['Admin', '/admin/login']] },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#070b18] pb-10 pt-16">
      <div className="container-x">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-ink-200/60">Simple, secure digital banking for everyday life.</p>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <p className="text-sm font-medium">{c.title}</p>
              <ul className="mt-4 space-y-2.5">
                {c.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-ink-200/60 transition hover:text-white">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col justify-between gap-3 border-t border-white/[0.06] pt-6 text-xs text-ink-200/50 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Novaro. All rights reserved.</p>
          <p>Novaro is a demo banking platform and is not a licensed bank.</p>
        </div>
      </div>
    </footer>
  );
}
