'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '@/lib/fetcher';
import { money } from '@/lib/format';
import Icon from '@/components/ui/Icon';
import { Spinner } from '@/components/ui/Field';
import { useBank } from '@/components/dashboard/BankProvider';
import Modal from '@/components/dashboard/Modal';
import { PageHeader, SuccessCheck } from '@/components/dashboard/bits';

const QUICK = [50, 100, 250, 500];

export default function TransferPage() {
  const { account, refresh, toast } = useBank();
  const [to, setTo] = useState('');
  const [recipient, setRecipient] = useState(null);
  const [lookupError, setLookupError] = useState('');
  const [looking, setLooking] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    setRecipient(null);
    setLookupError('');
    if (to.length !== 10) return;
    let cancelled = false;
    setLooking(true);
    api('/api/lookup', { body: { account_number: to } })
      .then((r) => !cancelled && setRecipient(r))
      .catch((e) => !cancelled && setLookupError(e.message))
      .finally(() => !cancelled && setLooking(false));
    return () => {
      cancelled = true;
    };
  }, [to]);

  const value = Number(amount);
  const tooMuch = value > Number(account.balance);
  const canContinue = recipient && value > 0 && !tooMuch;

  const send = async () => {
    setSending(true);
    try {
      const r = await api('/api/transfer', { body: { to_account: to, amount: value, note } });
      setResult(r);
      setConfirm(false);
      refresh();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setResult(null);
    setTo('');
    setAmount('');
    setNote('');
  };

  if (result) {
    return (
      <div className="panel mx-auto max-w-md p-6">
        <SuccessCheck
          title={result.status === 'pending' ? 'Transfer under review' : 'Money sent'}
          text={
            result.status === 'pending'
              ? `${money(value)} to ${result.recipient} is held for review. Large transfers are usually cleared within 24 hours.`
              : `${money(value)} is now in ${result.recipient}'s account.`
          }
        >
          <p className="mt-4 rounded-full bg-slate-100 px-3 py-1 font-mono text-xs text-slate-600">Ref {result.reference}</p>
          <div className="mt-6 grid w-full grid-cols-2 gap-3">
            <button onClick={reset} className="btn-ghost">Send again</button>
            <Link href="/dashboard" className="btn-dark">Done</Link>
          </div>
        </SuccessCheck>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Send money" subtitle="Transfer instantly to any Novaro account." />
      <div className="panel space-y-5 p-5 sm:p-6">
        <div>
          <label className="label">Recipient account number</label>
          <div className="relative">
            <input
              inputMode="numeric"
              maxLength={10}
              value={to}
              onChange={(e) => setTo(e.target.value.replace(/\D/g, ''))}
              placeholder="10-digit account number"
              className="field pr-10 font-mono tracking-wider"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{looking ? <Spinner /> : <Icon name="search" size={18} />}</span>
          </div>
          <AnimatePresence mode="wait">
            {recipient && (
              <motion.div key="ok" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 flex items-center gap-3 rounded-xl bg-emerald-50 p-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-emerald-600"><Icon name="check" size={18} /></span>
                <div>
                  <p className="text-sm font-semibold text-emerald-900">{recipient.name}</p>
                  <p className="text-xs text-emerald-700">Novaro · {recipient.account_number}</p>
                </div>
              </motion.div>
            )}
            {lookupError && (
              <motion.p key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
                <Icon name="alert" size={16} /> {lookupError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div>
          <label className="label">Amount (USD)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
            <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))} placeholder="0.00" className="field pl-8 font-display text-xl" />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {QUICK.map((q) => (
              <button key={q} type="button" onClick={() => setAmount(String(q))} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">
                ${q}
              </button>
            ))}
          </div>
          <p className={`mt-2 text-xs ${tooMuch ? 'text-red-600' : 'text-slate-500'}`}>
            {tooMuch ? 'Amount is more than your balance. ' : ''}Available: <span className="font-semibold">{money(account.balance)}</span>
          </p>
          {value > 10000 && !tooMuch && (
            <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <Icon name="info" size={15} /> Transfers above $10,000 are reviewed before release.
            </p>
          )}
        </div>

        <div>
          <label className="label">Note (optional)</label>
          <input value={note} maxLength={140} onChange={(e) => setNote(e.target.value)} placeholder="What's it for?" className="field" />
        </div>

        <button disabled={!canContinue} onClick={() => setConfirm(true)} className="btn-dark w-full py-3.5">
          Continue <Icon name="right" size={16} />
        </button>

        <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
          <Icon name="shield" size={17} className="mt-px shrink-0 text-slate-400" />
          Always check the recipient name before sending. Novaro will never ask you to move money to a &quot;safe account&quot;.
        </div>
      </div>

      <Modal open={confirm} onClose={() => !sending && setConfirm(false)} title="Confirm transfer">
        <div className="rounded-2xl bg-slate-50 p-5 text-center">
          <p className="text-xs uppercase tracking-wider text-slate-500">You are sending</p>
          <p className="mt-1 font-display text-4xl font-semibold">{money(value)}</p>
          <p className="mt-2 text-sm text-slate-600">to <span className="font-semibold">{recipient?.name}</span></p>
        </div>
        <dl className="mt-4 divide-y divide-slate-100 text-sm">
          <div className="flex justify-between py-3"><dt className="text-slate-500">Account</dt><dd className="font-mono">{to}</dd></div>
          <div className="flex justify-between py-3"><dt className="text-slate-500">Fee</dt><dd className="font-medium text-emerald-600">Free</dd></div>
          {note && <div className="flex justify-between py-3"><dt className="text-slate-500">Note</dt><dd>{note}</dd></div>}
          <div className="flex justify-between py-3"><dt className="text-slate-500">Balance after</dt><dd className="font-medium">{money(Number(account.balance) - value)}</dd></div>
        </dl>
        <button onClick={send} disabled={sending} className="btn-dark mt-4 w-full py-3.5">
          {sending ? <Spinner /> : <>Send {money(value)}</>}
        </button>
      </Modal>
    </div>
  );
}
