'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { api } from '@/lib/fetcher';
import { money, dateTime, txLabel } from '@/lib/format';
import Icon from '@/components/ui/Icon';
import { Spinner } from '@/components/ui/Field';
import { useToast } from '@/components/admin/AdminToaster';
import Modal from '@/components/dashboard/Modal';
import { PageHeader, StatusChip, Skeleton, Empty } from '@/components/dashboard/bits';

const TABS = ['pending', 'completed', 'rejected', 'all'];

export default function AdminTransactions() {
  const toast = useToast();
  const [tab, setTab] = useState('pending');
  const [rows, setRows] = useState(null);
  const [review, setReview] = useState(null); // { tx, approve }
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    let q = createClient()
      .from('transactions')
      .select('*, accounts!transactions_account_id_fkey(account_number, user_id, profiles(full_name, email))')
      .order('created_at', { ascending: tab === 'pending' })
      .limit(100);
    if (tab !== 'all') q = q.eq('status', tab);
    const { data } = await q;
    setRows(data || []);
  }, [tab]);

  useEffect(() => {
    setRows(null);
    load();
  }, [load]);

  const submit = async () => {
    setBusy(true);
    try {
      await api(`/api/admin/transactions/${review.tx.id}`, { method: 'PATCH', body: { approve: review.approve, note } });
      toast(review.approve ? 'Approved' : 'Rejected');
      setReview(null);
      setNote('');
      load();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const approveLabel = (t) => ({ deposit: 'Confirm funds received', withdrawal: 'Mark as paid out', transfer_out: 'Release transfer' }[t.type] || 'Approve');

  return (
    <div>
      <PageHeader title="Transactions" subtitle="Review deposits, withdrawals and large transfers." />
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-medium capitalize ${tab === t ? 'text-white' : 'bg-white text-slate-600'}`}>
            {tab === t && <motion.span layoutId="admin-tx-tab" className="absolute inset-0 rounded-full bg-ink-900" />}
            <span className="relative">{t}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {rows === null ? (
          [0, 1, 2].map((i) => <Skeleton key={i} className="h-24" />)
        ) : rows.length === 0 ? (
          <div className="panel"><Empty icon="check" title={tab === 'pending' ? 'Queue is empty' : 'No transactions'} /></div>
        ) : (
          <AnimatePresence initial={false}>
            {rows.map((t) => {
              const owner = t.accounts?.profiles;
              return (
                <motion.div key={t.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }} className="panel p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${t.direction === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-700'}`}>
                        <Icon name={t.direction === 'credit' ? 'download' : 'upload'} size={19} />
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold">
                          {txLabel[t.type]} · <span className="tabular-nums">{money(t.amount)}</span>
                        </p>
                        <p className="text-sm text-slate-600">
                          <Link href={`/admin/users/${t.accounts?.user_id}`} className="font-medium hover:underline">{owner?.full_name}</Link>
                          <span className="text-slate-400"> · {t.accounts?.account_number}</span>
                        </p>
                        <p className="text-xs text-slate-500">{t.reference} · {dateTime(t.created_at)} {t.method ? `· ${t.method.toUpperCase()}` : ''}</p>
                        {t.counterparty_name && <p className="text-xs text-slate-500">To/from: {t.counterparty_name}</p>}
                        {t.details?.bank_name && (
                          <p className="text-xs text-slate-500">Payout: {t.details.bank_name} · {t.details.account_name} · ••{String(t.details.account_number).slice(-4)}</p>
                        )}
                        {t.description && <p className="mt-1 text-xs italic text-slate-500">&ldquo;{t.description}&rdquo;</p>}
                      </div>
                    </div>
                    <StatusChip status={t.status} />
                  </div>
                  {t.status === 'pending' && (
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:justify-end">
                      <button onClick={() => setReview({ tx: t, approve: false })} className="btn-ghost text-red-600">Reject</button>
                      <button onClick={() => setReview({ tx: t, approve: true })} className="btn-dark">{approveLabel(t)}</button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <Modal open={!!review} onClose={() => !busy && setReview(null)} title={review?.approve ? 'Approve transaction' : 'Reject transaction'}>
        {review && (
          <>
            <p className="text-sm text-slate-600">
              {review.approve
                ? review.tx.type === 'deposit'
                  ? `Credit ${money(review.tx.amount)} to the customer. Only do this once the funds have actually arrived.`
                  : `Complete this ${txLabel[review.tx.type].toLowerCase()} of ${money(review.tx.amount)}.`
                : review.tx.type === 'deposit'
                ? 'The deposit will be marked as rejected. No money moves.'
                : `${money(review.tx.amount)} will be returned to the customer's balance.`}
            </p>
            <label className="label mt-4">Note to customer (optional)</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} className="field" placeholder={review.approve ? 'e.g. Funds received' : 'e.g. Sender name did not match'} />
            <button onClick={submit} disabled={busy} className={`btn-dark mt-5 w-full py-3.5 ${review.approve ? '' : 'bg-red-600 hover:bg-red-700'}`}>
              {busy ? <Spinner /> : review.approve ? 'Approve' : 'Reject'}
            </button>
          </>
        )}
      </Modal>
    </div>
  );
}
