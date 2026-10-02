import Link from 'next/link';
import Reveal from './Reveal';
import Icon from '@/components/ui/Icon';

const PLANS = [
  { name: 'Basic', price: '0', blurb: 'Everything you need for everyday banking.', features: ['Free checking account', '1 virtual card', 'Instant transfers', 'Spending insights'] },
  { name: 'Plus', price: '9', blurb: 'More cards and higher limits for active spenders.', features: ['Everything in Basic', '5 virtual cards', 'Priority support', 'Higher transfer limits'], featured: true },
  { name: 'Business', price: '29', blurb: 'Tools for freelancers and small teams.', features: ['Everything in Plus', 'Team cards', 'Export statements', 'Dedicated manager'] },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative bg-[#0b1226] py-24">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs uppercase tracking-[0.25em] text-brand-300">Pricing</span>
          <h2 className="mt-3 font-display text-4xl font-medium tracking-tight sm:text-5xl">Simple plans, no hidden fees</h2>
        </Reveal>
        <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.1}>
              <div
                className={`relative flex h-full flex-col rounded-3xl p-7 ${
                  p.featured
                    ? 'bg-gradient-to-b from-[#3a4a8a] to-[#1a2550] ring-1 ring-white/20'
                    : 'border border-white/[0.07] bg-white/[0.03]'
                }`}
              >
                {p.featured && (
                  <span className="absolute right-5 top-5 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-ink-900">Popular</span>
                )}
                <h3 className="font-display text-lg">{p.name}</h3>
                <p className="mt-1 text-sm text-ink-200/70">{p.blurb}</p>
                <p className="mt-6 font-display text-5xl font-medium">
                  ${p.price}<span className="text-base text-ink-200/60">/mo</span>
                </p>
                <ul className="mt-6 flex-1 space-y-3 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-ink-100/90">
                      <Icon name="tick" size={16} className="text-brand-300" /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`mt-8 rounded-full py-3 text-center text-sm font-semibold transition ${
                    p.featured ? 'bg-white text-ink-900 hover:bg-ink-100' : 'border border-white/15 hover:bg-white/10'
                  }`}
                >
                  Choose {p.name}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
