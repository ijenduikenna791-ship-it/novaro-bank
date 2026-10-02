'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/fetcher';
import { money } from '@/lib/format';
import Icon from '@/components/ui/Icon';
import { Spinner } from '@/components/ui/Field';
import { useBank } from '@/components/dashboard/BankProvider';
import { useCopy } from '@/components/dashboard/useCopy';
import { PageHeader, SuccessCheck } from '@/components/dashboard/bits';

const METHODS = [
  { id: 'wire', label: 'Bank wire', icon: 'bank', time: 'Same day' },
  { id: 'ach', label: 'ACH transfer', icon: 'transfer', time: '1–3 business days' },
  { id: 'check', label: 'Mobile check', icon: 'invoice', time: '1–2 business days' },
];

export default function DepositPage() {
  const { profile, account, toast } = useBank();
  const copy = useCopy();
  const [method, setMethod] = useState('wire');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(null);

  // Replace with your real settlement bank details in production.
  const instructions = [
    ['Beneficiary', profile.full_name],
    ['Reference / memo', account.account_number],
    ['Bank', 'Novaro Settlement Bank'],
    ['Routing number', '000000000'],
  ];

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await api('/api/deposit', { body: { amount, method, note } });
      setDone(r);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="panel mx-auto max-w-md p-6">
        <SuccessCheck title="Deposit submitted" text={`We will credit ${money(amount)} as soon as the funds arrive. You will get a notification.`}>
          <p className="mt-4 rounded-full bg-slate-100 px-3 py-1 font-mono text-xs text-slate-600">Ref {done.reference}</p>
          <Link href="/dashboard" className="btn-dark mt-6 w-full">Back to home</Link>
        </SuccessCheck>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Add money" subtitle="Choose how you want to fund your account." />
      <div className="grid grid-cols-3 gap-2.5">
        {METHODS.map((m) => (
          <button
            key={m.id}
            onClick={() => setMethod(m.id)}
            className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition sm:p-4 ${
              method === m.id ? 'border-ink-900 bg-white shadow-soft' : 'border-slate-200 bg-white/60 hover:bg-white'
            }`}
          >
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${method === m.id ? 'bg-ink-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
              <Icon name={m.icon} size={19} />
            </span>
            <span className="text-xs font-semibold sm:text-sm">{m.label}</span>
            <span className="hidden text-[11px] text-slate-500 sm:block">{m.time}</span>
          </button>
        ))}
      </div>

      <div className="panel mt-4 p-5">
        <p className="text-sm font-semibold">Send your funds using these details</p>
        <dl className="mt-3 divide-y divide-slate-100">
          {instructions.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <dt className="text-slate-500">{k}</dt>
              <dd className="flex items-center gap-2 font-medium">
                {v}
                <button onClick={() => copy(v, `${k} copied`)} className="text-slate-400 hover:text-brand-600" aria-label={`Copy ${k}`}><Icon name="copy" size={15} /></button>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-700">
          <Icon name="info" size={16} className="mt-px shrink-0" /> Always include your account number as the reference so we can match your deposit.
        </p>
      </div>

      <form onSubmit={submit} className="panel mt-4 space-y-4 p-5">
        <div>
          <label className="label">Amount you are sending</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
            <input required inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))} placeholder="0.00" className="field pl-8 font-display text-xl" />
          </div>
        </div>
        <div>
          <label className="label">Sender name or note (optional)</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={140} className="field" placeholder="e.g. Salary from Acme Inc" />
        </div>
        <button disabled={loading || !(Number(amount) > 0)} className="btn-dark w-full py-3.5">
          {loading ? <Spinner /> : 'I have sent the money'}
        </button>
      </form>
    </div>
  );
}
