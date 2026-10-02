'use client';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { dateOnly, txLabel } from '@/lib/format';
import Icon from '@/components/ui/Icon';
import { useBank } from '@/components/dashboard/BankProvider';
import Modal from '@/components/dashboard/Modal';
import { PageHeader, TxRow, TxReceipt, Empty, Skeleton } from '@/components/dashboard/bits';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'in', label: 'Money in' },
  { id: 'out', label: 'Money out' },
  { id: 'pending', label: 'Pending' },
];
const PAGE = 30;

export default function TransactionsPage() {
  const { account, hidden } = useBank();
  const [rows, setRows] = useState(null);
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [more, setMore] = useState(false);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    let query = supabase.from('transactions').select('*').eq('account_id', account.id).order('created_at', { ascending: false }).limit(limit + 1);
    if (filter === 'in') query = query.eq('direction', 'credit');
    if (filter === 'out') query = query.eq('direction', 'debit');
    if (filter === 'pending') query = query.eq('status', 'pending');
    query.then(({ data }) => {
      setMore((data || []).length > limit);
      setRows((data || []).slice(0, limit));
    });
  }, [account.id, account.balance, filter, limit]);

  const grouped = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = (rows || []).filter(
      (t) =>
        !term ||
        [t.counterparty_name, t.description, t.reference, txLabel[t.type]].some((v) => v?.toLowerCase().includes(term))
    );
    return list.reduce((acc, t) => {
      const day = dateOnly(t.created_at);
      (acc[day] ||= []).push(t);
      return acc;
    }, {});
  }, [rows, q]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Activity" subtitle="Every dollar in and out of your account." />
      <div className="relative">
        <Icon name="search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, reference or note" className="field pl-11" />
      </div>
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => {
              setFilter(f.id);
              setLimit(PAGE);
              setRows(null);
            }}
            className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${filter === f.id ? 'text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            {filter === f.id && <motion.span layoutId="tx-filter" className="absolute inset-0 rounded-full bg-ink-900" />}
            <span className="relative">{f.label}</span>
          </button>
        ))}
      </div>

      <div className="panel mt-4 p-2 sm:p-3">
        {rows === null ? (
          <div className="space-y-3 p-3">{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : Object.keys(grouped).length === 0 ? (
          <Empty title="Nothing here yet" text="Transactions that match will show up here." />
        ) : (
          Object.entries(grouped).map(([day, list]) => (
            <div key={day}>
              <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{day}</p>
              {list.map((t) => <TxRow key={t.id} tx={t} hidden={hidden} onClick={() => setOpen(t)} />)}
            </div>
          ))
        )}
        {more && (
          <button onClick={() => setLimit((l) => l + PAGE)} className="btn-ghost mx-auto my-3 flex">Load more</button>
        )}
      </div>

      <Modal open={!!open} onClose={() => setOpen(null)} title="Transaction details">
        <TxReceipt tx={open} />
      </Modal>
    </div>
  );
}
