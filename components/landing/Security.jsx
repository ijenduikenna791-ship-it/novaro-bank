import Image from 'next/image';
import Reveal from './Reveal';
import Icon from '@/components/ui/Icon';
import { photos } from './images';

const ITEMS = [
  { icon: 'lock', title: 'Encrypted sessions', text: 'TLS everywhere and row-level security on every record.' },
  { icon: 'fingerprint', title: 'Private by design', text: 'Only you can see your balance and transactions.' },
  { icon: 'snow', title: 'Freeze in one tap', text: 'Lost a card? Freeze it instantly from your dashboard.' },
  { icon: 'activity', title: 'Large transfer review', text: 'Transfers above $10,000 get a second look before release.' },
];

export default function Security() {
  return (
    <section className="relative overflow-hidden bg-[#0b1226] py-24">
      <div className="container-x grid grid-cols-1 items-center gap-14 lg:grid-cols-[1fr_1.05fr]">
        <div>
          <Reveal>
            <span className="text-xs uppercase tracking-[0.25em] text-brand-300">Security</span>
            <h2 className="mt-3 font-display text-4xl font-medium tracking-tight sm:text-5xl">Your money, guarded around the clock</h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ITEMS.map((it, i) => (
              <Reveal key={it.title} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
                  <Icon name={it.icon} size={22} className="text-brand-300" />
                  <h3 className="mt-4 font-medium">{it.title}</h3>
                  <p className="mt-1 text-sm text-ink-200/70">{it.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={0.1} className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] border border-white/10">
            <Image src={photos.womanPaying} alt="Woman paying with her phone" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0b1226]/90 via-[#0b1226]/10 to-transparent" />
          </div>
          <div className="glass absolute -bottom-6 left-6 flex items-center gap-3 rounded-2xl bg-ink-900/70 px-4 py-3">
            <Icon name="shieldCheck" size={22} className="text-emerald-300" />
            <div>
              <p className="text-sm font-medium">Login protected</p>
              <p className="text-xs text-ink-200/70">New device verified just now</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
