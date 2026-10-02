import Reveal from './Reveal';
import Icon from '@/components/ui/Icon';

const FLOW = [
  {
    icon: 'send',
    title: 'Transfers up to $10,000',
    text: 'Sent instantly between Novaro accounts. You see the recipient name before you confirm, and both sides get a receipt.',
  },
  {
    icon: 'hourglass',
    title: 'Transfers above $10,000',
    text: 'Held for a manual review before release. If a transfer is declined, the full amount goes straight back to your balance.',
  },
  {
    icon: 'download',
    title: 'Deposits',
    text: 'Credited only after the incoming wire, ACH or check is confirmed as received. Nothing is added to your balance before that.',
  },
  {
    icon: 'upload',
    title: 'Withdrawals',
    text: 'Funds are set aside the moment you request a withdrawal, then paid out. If it cannot be completed, the money is returned.',
  },
];

const PROTECTION = [
  { icon: 'lock', title: 'Private by default', text: 'Each customer can only read their own accounts, cards and transactions, enforced in the database itself.' },
  { icon: 'shieldCheck', title: 'Ledger-only balances', text: 'Balances change only through recorded transactions. No one can quietly edit a number.' },
  { icon: 'activity', title: 'Every staff action logged', text: 'Approvals, rejections and account changes are written to an audit log with who, what and when.' },
  { icon: 'snow', title: 'You stay in control', text: 'Freeze or close a card in one tap, and get a notification for every movement on your account.' },
];

export default function Transparency() {
  return (
    <section id="transparency" className="relative bg-[#0b1226] py-24">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs uppercase tracking-[0.25em] text-brand-300">Security &amp; transparency</span>
          <h2 className="mt-3 font-display text-4xl font-medium tracking-tight sm:text-5xl">How your money moves</h2>
          <p className="mt-4 text-ink-200/70">No hidden steps. Here is exactly what happens when money comes in, goes out, or needs a second look.</p>
        </Reveal>

        <div className="relative mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FLOW.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08}>
              <div className="relative h-full rounded-3xl border border-white/[0.07] bg-gradient-to-b from-[#16204a] to-[#0d1430] p-6">
                <div className="flex items-center justify-between">
                  <span className="glass grid h-11 w-11 place-items-center rounded-full"><Icon name={f.icon} size={20} /></span>
                  <span className="font-display text-sm text-ink-200/40">0{i + 1}</span>
                </div>
                <h3 className="mt-6 font-display text-lg font-medium">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-200/70">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 rounded-[32px] border border-white/[0.07] bg-white/[0.02] p-6 sm:p-10 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <h3 className="font-display text-2xl font-medium sm:text-3xl">How accounts are protected</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-200/70">
              Security is built into how the platform stores and moves data, not added on top.
            </p>
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm text-amber-100/90">
              <Icon name="info" size={18} className="mt-0.5 shrink-0" />
              <p>Novaro is a trusted bank with robust security measures in place.</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PROTECTION.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.06}>
                <div className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
                  <Icon name={p.icon} size={22} className="text-brand-300" />
                  <h4 className="mt-3 font-medium">{p.title}</h4>
                  <p className="mt-1 text-sm text-ink-200/70">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
