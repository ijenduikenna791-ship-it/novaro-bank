'use client';
import { motion } from 'framer-motion';
import Icon from '@/components/ui/Icon';
import { money, dateTime, txLabel } from '@/lib/format';

const STATUS_STYLES = {
  completed: 'bg-emerald-50 text-emerald-700',
  active: 'bg-emerald-50 text-emerald-700',
  verified: 'bg-emerald-50 text-emerald-700',
  answered: 'bg-blue-50 text-blue-700',
  pending: 'bg-amber-50 text-amber-700',
  open: 'bg-amber-50 text-amber-700',
  frozen: 'bg-sky-50 text-sky-700',
  unverified: 'bg-slate-100 text-slate-600',
  closed: 'bg-slate-100 text-slate-600',
  rejected: 'bg-red-50 text-red-700',
  suspended: 'bg-red-50 text-red-700',
  terminated: 'bg-red-50 text-red-700',
};

export function StatusChip({ status }) {
  return (
    <span className={`chip ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-600'}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

const TX_ICON = {
  deposit: 'download',
  withdrawal: 'upload',
  transfer_in: 'down',
  transfer_out: 'upRight',
  card_funding: 'card',
  card_refund: 'refresh',
};

export function TxRow({ tx, onClick, hidden }) {
  const credit = tx.direction === 'credit';
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl px-2 py-3 text-left transition hover:bg-slate-50">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${credit ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-700'}`}>
        <Icon name={TX_ICON[tx.type] || 'transfer'} size={19} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-slate-900">{tx.counterparty_name || tx.description || txLabel[tx.type]}</span>
        <span className="block truncate text-xs text-slate-500">
          {txLabel[tx.type]} · {dateTime(tx.created_at)}
        </span>
      </span>
      <span className="text-right">
        <span className={`block text-sm font-semibold tabular-nums ${credit ? 'text-emerald-600' : 'text-slate-900'}`}>
          {hidden ? '••••' : `${credit ? '+' : '-'}${money(tx.amount)}`}
        </span>
        {tx.status !== 'completed' && <StatusChip status={tx.status} />}
      </span>
    </button>
  );
}

export function TxReceipt({ tx }) {
  if (!tx) return null;
  const credit = tx.direction === 'credit';
  const rows = [
    ['Type', txLabel[tx.type]],
    ['Status', <StatusChip key="s" status={tx.status} />],
    ['Reference', tx.reference],
    ['Date', dateTime(tx.created_at)],
    tx.counterparty_name && [credit ? 'From' : 'To', tx.counterparty_name],
    tx.method && ['Method', tx.method.toUpperCase()],
    tx.description && ['Description', tx.description],
    tx.review_note && ['Note', tx.review_note],
  ].filter(Boolean);
  return (
    <div>
      <div className="rounded-2xl bg-slate-50 p-5 text-center">
        <p className="text-xs uppercase tracking-wider text-slate-500">{credit ? 'Money in' : 'Money out'}</p>
        <p className={`mt-1 font-display text-3xl font-semibold ${credit ? 'text-emerald-600' : 'text-slate-900'}`}>
          {credit ? '+' : '-'}
          {money(tx.amount)}
        </p>
      </div>
      <dl className="mt-4 divide-y divide-slate-100">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-4 py-3 text-sm">
            <dt className="text-slate-500">{k}</dt>
            <dd className="text-right font-medium text-slate-900">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Empty({ icon = 'invoice', title, text, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon name={icon} size={26} />
      </span>
      <p className="mt-4 font-semibold text-slate-800">{title}</p>
      {text && <p className="mt-1 max-w-xs text-sm text-slate-500">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SuccessCheck({ title, text, children }) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="grid h-20 w-20 place-items-center rounded-full bg-emerald-50"
      >
        <svg viewBox="0 0 52 52" className="h-11 w-11">
          <motion.path
            d="M14 27l8 8 16-17"
            fill="none"
            stroke="#059669"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          />
        </svg>
      </motion.div>
      <h3 className="mt-5 font-display text-xl font-semibold text-slate-900">{title}</h3>
      {text && <p className="mt-1 max-w-xs text-sm text-slate-500">{text}</p>}
      {children}
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={`skeleton ${className}`} />;
}
