import Image from 'next/image';
import Reveal from './Reveal';
import Icon from '@/components/ui/Icon';
import { photos } from './images';

const POINTS = [
  { icon: 'card', title: 'Virtual cards in seconds', text: 'Create up to five cards for subscriptions and online shopping. Freeze or close any card with one tap.' },
  { icon: 'transfer', title: 'Send and receive', text: 'Pay friends with just an account number. See who you are paying before you confirm.' },
  { icon: 'chart', title: 'Spending that makes sense', text: 'Income, spending and balance trends, drawn from your real transactions.' },
];

export default function Products() {
  return (
    <section id="products" className="relative overflow-hidden bg-[#080d1d] py-24">
      <div className="container-x grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
        <Reveal className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] border border-white/10 sm:aspect-[5/5]">
            <Image src={photos.phoneAndCard} alt="Person paying online with a phone and card" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080d1d] via-[#080d1d]/20 to-transparent" />
          </div>
          {/* floating UI chips */}
          <div className="glass absolute bottom-6 left-4 right-4 rounded-2xl bg-ink-900/60 p-4 sm:left-8 sm:right-auto sm:w-72">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                <Icon name="check" size={20} />
              </span>
              <div>
                <p className="text-sm font-medium">Transfer complete</p>
                <p className="text-xs text-ink-200/70">$1,250.00 sent to Maya L.</p>
              </div>
            </div>
          </div>
          <div className="glass absolute right-4 top-6 hidden animate-float rounded-2xl bg-ink-900/60 px-4 py-3 sm:block">
            <p className="text-[11px] uppercase tracking-wider text-ink-200/70">This month</p>
            <p className="font-display text-xl">+ $4,820.40</p>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <span className="text-xs uppercase tracking-[0.25em] text-brand-300">Products</span>
            <h2 className="mt-3 font-display text-4xl font-medium tracking-tight sm:text-5xl">
              One account.<br />Everything you need.
            </h2>
          </Reveal>
          <div className="mt-10 space-y-3">
            {POINTS.map((p, i) => (
              <Reveal key={p.title} delay={0.1 * i}>
                <div className="flex gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition hover:bg-white/[0.05]">
                  <span className="glass grid h-11 w-11 shrink-0 place-items-center rounded-xl">
                    <Icon name={p.icon} size={20} />
                  </span>
                  <div>
                    <h3 className="font-medium">{p.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-200/70">{p.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
