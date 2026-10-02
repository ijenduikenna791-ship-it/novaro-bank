'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/fetcher';
import { money } from '@/lib/format';
import { Spinner } from '@/components/ui/Field';
import Icon from '@/components/ui/Icon';
import { useBank } from '@/components/dashboard/BankProvider';
import { PageHeader, SuccessCheck } from '@/components/dashboard/bits';

export default function WithdrawPage() {
  const { account, refresh, toast } = useBank();
  const [form, setForm] = useState({ amount: '', method: 'ach', bank_name: '', account_name: '', account_number: '', routing_number: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const over = Number(form.amount) > Number(account.balance);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      setDone(await api('/api/withdraw', { body: form }));
      refresh();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="panel mx-auto max-w-md p-6">
        <SuccessCheck title="Withdrawal requested" text={`${money(form.amount)} is on hold and will be sent to ${form.bank_name} after processing.`}>
          <p className="mt-4 rounded-full bg-slate-100 px-3 py-1 font-mono text-xs text-slate-600">Ref {done.reference}</p>
          <Link href="/dashboard" className="btn-dark mt-6 w-full">Back to home</Link>
        </SuccessCheck>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Withdraw" subtitle="Move money to your account at another bank." />
      <form onSubmit={submit} className="panel space-y-4 p-5 sm:p-6">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          {[['ach', 'ACH · free'], ['wire', 'Wire · same day']].map(([id, label]) => (
            <button type="button" key={id} onClick={() => setForm({ ...form, method: id })} className={`rounded-lg py-2 text-sm font-medium transition ${form.method === id ? 'bg-white shadow-sm' : 'text-slate-500'}`}>
              {label}
            </button>
          ))}
        </div>
        <div>
          <label className="label">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
            <input required inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/[^\d.]/g, '') })} className="field pl-8 font-display text-xl" placeholder="0.00" />
          </div>
          <p className={`mt-1.5 text-xs ${over ? 'text-red-600' : 'text-slate-500'}`}>Available: {money(account.balance)}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><label className="label">Bank name</label><input required value={form.bank_name} onChange={set('bank_name')} className="field" placeholder="e.g. Chase" /></div>
          <div><label className="label">Account holder</label><input required value={form.account_name} onChange={set('account_name')} className="field" placeholder="Name on account" /></div>
          <div><label className="label">Account number</label><input required inputMode="numeric" value={form.account_number} onChange={set('account_number')} className="field font-mono" /></div>
          <div><label className="label">Routing number</label><input inputMode="numeric" value={form.routing_number} onChange={set('routing_number')} className="field font-mono" /></div>
        </div>
        <button disabled={loading || over || !(Number(form.amount) > 0)} className="btn-dark w-full py-3.5">
          {loading ? <Spinner /> : <>Withdraw {Number(form.amount) > 0 ? money(form.amount) : ''}</>}
        </button>
        <p className="flex items-start gap-2 text-xs text-slate-500">
          <Icon name="info" size={15} className="mt-px shrink-0" /> The amount is held from your balance right away. If the withdrawal can&apos;t be completed, it is returned to you.
        </p>
      </form>
    </div>
  );
}
