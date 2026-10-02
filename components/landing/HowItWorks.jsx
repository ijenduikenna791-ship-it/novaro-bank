import Reveal from './Reveal';
import Icon from '@/components/ui/Icon';

const STEPS = [
  { icon: 'user', title: 'Create your account', text: 'Sign up with your email. Your account number is issued instantly.' },
  { icon: 'badge', title: 'Verify your identity', text: 'Submit your details for review to unlock higher limits.' },
  { icon: 'wallet', title: 'Add money and go', text: 'Fund your account by wire or ACH, then send, spend and save.' },
];

export default function HowItWorks() {
  return (
    <section id="about" className="relative bg-gradient-to-b from-[#080d1d] to-[#0b1226] py-24">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs uppercase tracking-[0.25em] text-brand-300">How it works</span>
          <h2 className="mt-3 font-display text-4xl font-medium tracking-tight sm:text-5xl">Up and running in three steps</h2>
        </Reveal>
        <div className="relative mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent md:block" />
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.12} className="relative text-center">
              <div className="relative mx-auto grid h-14 w-14 place-items-center rounded-full border border-white/15 bg-ink-800 text-white shadow-glass">
                <Icon name={s.icon} size={22} />
                <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] font-bold text-ink-900">{i + 1}</span>
              </div>
              <h3 className="mt-6 font-display text-xl font-medium">{s.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink-200/70">{s.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
