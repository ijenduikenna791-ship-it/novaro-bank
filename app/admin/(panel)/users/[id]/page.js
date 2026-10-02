'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { api } from '@/lib/fetcher';
import { money, dateOnly, initials } from '@/lib/format';
import Icon from '@/components/ui/Icon';
import { Spinner } from '@/components/ui/Field';
import { useToast } from '@/components/admin/AdminToaster';
import Modal from '@/components/dashboard/Modal';
import VirtualCard from '@/components/dashboard/VirtualCard';
import { StatusChip, TxRow, TxReceipt, Skeleton, Empty } from '@/components/dashboard/bits';

export default function AdminUserDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [txs, setTxs] = useState([]);
  const [cards, setCards] = useState([]);
  const [busy, setBusy] = useState('');
  const [receipt, setReceipt] = useState(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const [{ data: p }, { data: a }, { data: c }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('accounts').select('*').eq('user_id', id).single(),
      supabase.from('cards').select('*').eq('user_id', id).order('created_at', { ascending: false }),
    ]);
    setUser(p);
    setAccount(a);
    setCards(c || []);
    if (a) {
      const { data: t } = await supabase.from('transactions').select('*').eq('account_id', a.id).order('created_at', { ascending: false }).limit(50);
      setTxs(t || []);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const update = async (key, body) => {
    setBusy(key);
    try {
      await api(`/api/admin/users/${id}`, { method: 'PATCH', body });
      toast('Customer updated');
      load();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy('');
    }
  };

  if (!user) return <div className="space-y-4"><Skeleton className="h-40" /><Skeleton className="h-64" /></div>;

  const Btn = ({ k, body, children, tone = 'btn-ghost' }) => (
    <button disabled={!!busy} onClick={() => update(k, body)} className={tone}>
      {busy === k ? <Spinner /> : children}
    </button>
  );

  return (
    <div>
      <Link href="/admin/users" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
        <Icon name="left" size={16} /> Customers
      </Link>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-4">
          <section className="panel p-5">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-ink-900 font-semibold text-white">{initials(user.full_name)}</span>
              <div className="min-w-0">
                <h1 className="truncate font-display text-xl font-semibold">{user.full_name}</h1>
                <p className="truncate text-sm text-slate-500">{user.email}</p>
              </div>
            </div>
            <dl className="mt-5 divide-y divide-slate-100 text-sm">
              {[
                ['Account', <span key="a" className="font-mono">{account?.account_number}</span>],
                ['Balance', <span key="b" className="font-semibold">{money(account?.balance)}</span>],
                ['Status', <StatusChip key="s" status={user.status} />],
                ['Identity', <StatusChip key="k" status={user.kyc_status} />],
                ['Role', user.role],
                ['Phone', user.phone || '—'],
                ['Address', user.address || '—'],
                ['Joined', dateOnly(user.created_at)],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4 py-2.5"><dt className="text-slate-500">{k}</dt><dd className="text-right">{v}</dd></div>
              ))}
            </dl>
          </section>

          <section className="panel space-y-4 p-5">
            <h2 className="font-semibold">Actions</h2>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Account status</p>
              <div className="flex flex-wrap gap-2">
                {user.status !== 'active' && <Btn k="active" body={{ status: 'active' }}><Icon name="check" size={16} /> Reactivate</Btn>}
                {user.status !== 'frozen' && <Btn k="frozen" body={{ status: 'frozen' }}><Icon name="snow" size={16} /> Freeze</Btn>}
                {user.status !== 'suspended' && <Btn k="suspended" body={{ status: 'suspended' }}><Icon name="x" size={16} /> Suspend</Btn>}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Identity verification</p>
              <div className="flex flex-wrap gap-2">
                {user.kyc_status !== 'verified' && <Btn k="verify" body={{ kyc_status: 'verified' }} tone="btn-dark"><Icon name="badge" size={16} /> Approve</Btn>}
                {user.kyc_status !== 'rejected' && <Btn k="reject" body={{ kyc_status: 'rejected' }}>Reject</Btn>}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Role</p>
              {user.role === 'admin' ? (
                <Btn k="user" body={{ role: 'user' }}>Remove admin access</Btn>
              ) : (
                <Btn k="admin" body={{ role: 'admin' }}><Icon name="shieldCheck" size={16} /> Make admin</Btn>
              )}
            </div>
            <p className="text-xs text-slate-500">Balances change only through transactions. Every admin action is written to the audit log.</p>
          </section>
        </div>

        <div className="space-y-4">
          <section className="panel p-2">
            <h2 className="px-3 py-2 font-semibold">Transactions</h2>
            {txs.length === 0 ? <Empty title="No transactions" /> : txs.map((t) => <TxRow key={t.id} tx={t} onClick={() => setReceipt(t)} />)}
          </section>
          <section className="panel p-5">
            <h2 className="mb-3 font-semibold">Cards</h2>
            {cards.length === 0 ? (
              <p className="text-sm text-slate-500">No cards.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {cards.map((c) => (
                  <div key={c.id}>
                    <VirtualCard card={c} />
                    <div className="mt-2 flex items-center justify-between text-sm"><span>{money(c.balance)}</span><StatusChip status={c.status} /></div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <Modal open={!!receipt} onClose={() => setReceipt(null)} title="Transaction details">
        <TxReceipt tx={receipt} />
      </Modal>
    </div>
  );
}
