'use client';
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { api } from '@/lib/fetcher';
import { dateTime } from '@/lib/format';
import Icon from '@/components/ui/Icon';
import { Spinner } from '@/components/ui/Field';
import { useToast } from '@/components/admin/AdminToaster';
import Modal from '@/components/dashboard/Modal';
import { PageHeader, StatusChip, Skeleton, Empty } from '@/components/dashboard/bits';

export default function AdminSupport() {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [status, setStatus] = useState('open');
  const [open, setOpen] = useState(null);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    let q = createClient().from('support_tickets').select('*, profiles(full_name, email)').order('created_at', { ascending: false });
    if (status !== 'all') q = q.eq('status', status);
    const { data } = await q;
    setRows(data || []);
  }, [status]);

  useEffect(() => {
    setRows(null);
    load();
  }, [load]);

  const send = async (close) => {
    setBusy(true);
    try {
      await api(`/api/admin/tickets/${open.id}`, { method: 'PATCH', body: { reply, close } });
      toast(close ? 'Ticket closed' : 'Reply sent');
      setOpen(null);
      setReply('');
      load();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Support"
        subtitle="Customer messages."
        action={
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="field w-40">
            <option value="open">Open</option>
            <option value="answered">Answered</option>
            <option value="closed">Closed</option>
            <option value="all">All</option>
          </select>
        }
      />
      <div className="panel divide-y divide-slate-100">
        {rows === null ? (
          <div className="space-y-3 p-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : rows.length === 0 ? (
          <Empty icon="message" title="No tickets" />
        ) : (
          rows.map((t) => (
            <button key={t.id} onClick={() => { setOpen(t); setReply(t.admin_reply || ''); }} className="flex w-full items-center gap-3 p-4 text-left hover:bg-slate-50">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600"><Icon name="message" size={18} /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{t.subject}</span>
                <span className="block truncate text-xs text-slate-500">{t.profiles?.full_name} · {dateTime(t.created_at)}</span>
              </span>
              <StatusChip status={t.status} />
            </button>
          ))
        )}
      </div>

      <Modal open={!!open} onClose={() => !busy && setOpen(null)} title={open?.subject || ''} wide>
        {open && (
          <>
            <p className="text-xs text-slate-500">{open.profiles?.full_name} · {open.profiles?.email}</p>
            <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm">{open.message}</div>
            <label className="label mt-4">Your reply</label>
            <textarea rows={5} value={reply} onChange={(e) => setReply(e.target.value)} className="field resize-none" placeholder="Write a reply…" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button disabled={busy} onClick={() => send(true)} className="btn-ghost">Reply and close</button>
              <button disabled={busy || !reply.trim()} onClick={() => send(false)} className="btn-dark">{busy ? <Spinner /> : 'Send reply'}</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
