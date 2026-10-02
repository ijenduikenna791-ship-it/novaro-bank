import Reveal from './Reveal';
import Icon from '@/components/ui/Icon';

const FEATURES = [
  { icon: 'shieldCheck', title: 'Bank-grade security', text: 'Every session is encrypted end to end, and every transfer is checked before it leaves your account.' },
  { icon: 'flash', title: 'Instant transfers', text: 'Send money to any Novaro account in seconds, any time of day, with no transfer fees.' },
  { icon: 'search', title: 'Clear insights', text: 'See exactly where your money goes with live spending breakdowns and monthly summaries.' },
];

export default function Features() {
  return (
    <section id="features" className="relative bg-[#080d1d] pb-24 pt-6">
      <div className="container-x grid grid-cols-1 gap-4 md:grid-cols-3">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.1}>
            <div className="group relative h-full overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-b from-[#16204a] to-[#0d1430] p-7 transition duration-500 hover:-translate-y-1 hover:border-white/15">
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-400/10 blur-2xl transition duration-500 group-hover:bg-brand-400/25" />
              <div className="glass grid h-12 w-12 place-items-center rounded-full text-white">
                <Icon name={f.icon} size={22} />
              </div>
              <h3 className="mt-10 font-display text-xl font-medium">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-200/70">{f.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
