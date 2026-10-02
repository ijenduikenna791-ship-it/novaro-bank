import Icon from '@/components/ui/Icon';

const PARTNERS = [
  { name: 'Luminous', icon: 'sparkles' },
  { name: 'FeatherDev', icon: 'leaf' },
  { name: 'Spherule', icon: 'atom' },
  { name: 'Nietzsche', icon: 'star' },
  { name: 'Epicurious', icon: 'diamond' },
  { name: 'Acme Corp', icon: 'flash' },
];

export default function Partners() {
  const row = [...PARTNERS, ...PARTNERS];
  return (
    <section className="relative bg-[#080d1d] py-12">
      <p className="text-center text-sm text-ink-200/60">We have partnered with</p>
      <div className="relative mt-6 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <div className="flex w-max animate-marquee gap-14 pr-14 hover:[animation-play-state:paused]">
          {row.map((p, i) => (
            <div key={i} className="flex items-center gap-2 text-ink-100/70 transition hover:text-white">
              <Icon name={p.icon} size={26} strokeWidth={1.5} />
              <span className="font-display text-xl font-medium tracking-tight">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
