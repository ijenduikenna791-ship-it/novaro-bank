'use client';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { api } from '@/lib/fetcher';
import { dateTime } from '@/lib/format';
import Icon from '@/components/ui/Icon';
import { Spinner } from '@/components/ui/Field';
import { useBank } from '@/components/dashboard/BankProvider';
import { PageHeader, StatusChip, Empty, Skeleton } from '@/components/dashboard/bits';

export default function SupportPage() {
  const { profile, toast } = useBank();
  const [tickets, setTickets] = useState(null);
  const [form, setForm] = useState({ subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(null);

  const load = useCallback(async () => {
    const { data } = await createClient().from('support_tickets').select('*').eq('user_id', profile.id).order('created_at', { ascending: false });
    setTickets(data || []);
  }, [profile.id]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api('/api/support', { body: form });
      toast('Message sent. We will reply here.');
      setForm({ subject: '', message: '' });
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <PageHeader title="Support" subtitle="Ask us anything. Replies appear in your tickets." />
        <form onSubmit={submit} className="panel space-y-4 p-5">
          <div><label className="label">Subject</label><input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} maxLength={120} className="field" placeholder="e.g. Deposit not showing" /></div>
          <div><label className="label">Message</label><textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={2000} className="field resize-none" placeholder="Tell us what happened. Include any reference numbers." /></div>
          <button disabled={sending} className="btn-dark w-full">{sending ? <Spinner /> : <><Icon name="send" size={17} /> Send message</>}</button>
          <p className="flex items-start gap-2 text-xs text-slate-500"><Icon name="shield" size={15} className="mt-px shrink-0" /> We will never ask for your password or card details.</p>
        </form>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold lg:mt-[68px]">Your tickets</h2>
        <div className="panel divide-y divide-slate-100">
          {tickets === null ? (
            <div className="space-y-3 p-4">{[0, 1].map((i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : tickets.length === 0 ? (
            <Empty icon="message" title="No tickets yet" text="Messages you send will appear here." />
          ) : (
            tickets.map((t) => (
              <div key={t.id}>
                <button onClick={() => setOpen(open === t.id ? null : t.id)} className="flex w-full items-center gap-3 p-4 text-left hover:bg-slate-50">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600"><Icon name="message" size={18} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{t.subject}</span>
                    <span className="block text-xs text-slate-500">{dateTime(t.created_at)}</span>
                  </span>
                  <StatusChip status={t.status} />
                </button>
                <AnimatePresence>
                  {open === t.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="space-y-3 px-4 pb-4">
                        <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-ink-900 p-3 text-sm text-white">{t.message}</div>
                        {t.admin_reply ? (
                          <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-100 p-3 text-sm">
                            <p className="mb-1 text-xs font-semibold text-brand-600">Novaro Support</p>
                            {t.admin_reply}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500">Waiting for a reply from our team.</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
