'use client';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { api } from '@/lib/fetcher';
import { money } from '@/lib/format';
import Icon from '@/components/ui/Icon';
import { Spinner } from '@/components/ui/Field';
import { useBank } from '@/components/dashboard/BankProvider';
import Modal from '@/components/dashboard/Modal';
import VirtualCard, { THEMES } from '@/components/dashboard/VirtualCard';
import { PageHeader, StatusChip, Empty, Skeleton } from '@/components/dashboard/bits';

export default function CardsPage() {
  const { profile, account, refresh, toast, hidden } = useBank();
  const [cards, setCards] = useState(null);
  const [active, setActive] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [modal, setModal] = useState(null); // 'create' | 'fund' | 'terminate'
  const [busy, setBusy] = useState(false);
  const [label, setLabel] = useState('');
  const [theme, setTheme] = useState('midnight');
  const [amount, setAmount] = useState('');

  const load = useCallback(async () => {
    const { data } = await createClient().from('cards').select('*').eq('user_id', profile.id).neq('status', 'terminated').order('created_at', { ascending: false });
    setCards(data || []);
  }, [profile.id]);

  useEffect(() => {
    load();
  }, [load]);

  const card = cards?.[active];

  const act = async (action, body = {}) => {
    setBusy(true);
    try {
      if (action === 'create') {
        await api('/api/cards', { body: { label, theme } });
        toast('Card created');
        setActive(0);
        setLabel('');
      } else {
        await api(`/api/cards/${card.id}`, { method: 'PATCH', body: { action, ...body } });
        toast({ freeze: 'Card frozen', unfreeze: 'Card unfrozen', fund: 'Card funded', terminate: 'Card closed' }[action]);
        if (action === 'terminate') setActive(0);
      }
      setModal(null);
      setAmount('');
      await load();
      refresh();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Cards"
        subtitle="Virtual cards for safer online payments."
        action={
          <button onClick={() => setModal('create')} className="btn-dark" disabled={cards?.length >= 5}>
            <Icon name="plus" size={17} /> New card
          </button>
        }
      />

      {cards === null ? (
        <Skeleton className="aspect-[1.586/1] max-w-md" />
      ) : cards.length === 0 ? (
        <div className="panel">
          <Empty icon="card" title="No cards yet" text="Create a virtual card in seconds. Fund it from your balance and freeze it any time." action={<button onClick={() => setModal('create')} className="btn-dark"><Icon name="plus" size={17} /> Create card</button>} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
          <div>
            <AnimatePresence mode="wait">
              <motion.div key={card?.id} initial={{ opacity: 0, rotateY: -25, x: 30 }} animate={{ opacity: 1, rotateY: 0, x: 0 }} exit={{ opacity: 0, rotateY: 25, x: -30 }} transition={{ duration: 0.45 }} style={{ perspective: 1000 }}>
                {card && <VirtualCard card={card} reveal={reveal} />}
              </motion.div>
            </AnimatePresence>
            {cards.length > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                {cards.map((c, i) => (
                  <button key={c.id} onClick={() => { setActive(i); setReveal(false); }} className={`h-2 rounded-full transition-all ${i === active ? 'w-6 bg-ink-900' : 'w-2 bg-slate-300'}`} aria-label={`Card ${i + 1}`} />
                ))}
              </div>
            )}
          </div>

          {card && (
            <div className="space-y-4">
              <div className="panel p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{card.label}</p>
                    <p className="font-display text-3xl font-semibold">{hidden ? '••••' : money(card.balance)}</p>
                  </div>
                  <StatusChip status={card.status} />
                </div>
                <div className="mt-5 grid grid-cols-4 gap-2">
                  {[
                    { label: reveal ? 'Hide' : 'Details', icon: reveal ? 'eyeOff' : 'eye', onClick: () => setReveal((r) => !r) },
                    { label: 'Add funds', icon: 'plus', onClick: () => setModal('fund'), disabled: card.status !== 'active' },
                    card.status === 'frozen'
                      ? { label: 'Unfreeze', icon: 'refresh', onClick: () => act('unfreeze') }
                      : { label: 'Freeze', icon: 'snow', onClick: () => act('freeze') },
                    { label: 'Close', icon: 'trash', onClick: () => setModal('terminate'), danger: true },
                  ].map((b) => (
                    <button key={b.label} onClick={b.onClick} disabled={busy || b.disabled} className={`flex flex-col items-center gap-1.5 rounded-2xl py-3 text-xs font-medium transition disabled:opacity-40 ${b.danger ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>
                      <Icon name={b.icon} size={20} />
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="panel divide-y divide-slate-100 px-5 text-sm">
                {[
                  ['Card number', reveal ? card.card_number.replace(/(\d{4})(?=\d)/g, '$1 ') : `•••• ${card.card_number.slice(-4)}`],
                  ['Expiry', `${String(card.expiry_month).padStart(2, '0')}/${card.expiry_year}`],
                  ['CVV', reveal ? card.cvv : '•••'],
                  ['Holder', card.holder_name],
                  ['Type', 'Virtual · online only'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-3"><span className="text-slate-500">{k}</span><span className="font-medium">{v}</span></div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal open={modal === 'create'} onClose={() => setModal(null)} title="Create a virtual card">
        <label className="label">Card name</label>
        <input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={40} placeholder="e.g. Subscriptions" className="field" />
        <p className="label mt-4">Style</p>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(THEMES).map(([id, cls]) => (
            <button key={id} onClick={() => setTheme(id)} className={`aspect-[1.586/1] rounded-xl bg-gradient-to-br ${cls} ring-offset-2 transition ${theme === id ? 'ring-2 ring-ink-900' : ''}`} aria-label={id} />
          ))}
        </div>
        <button onClick={() => act('create')} disabled={busy} className="btn-dark mt-5 w-full py-3.5">{busy ? <Spinner /> : 'Create card'}</button>
      </Modal>

      <Modal open={modal === 'fund'} onClose={() => setModal(null)} title="Add funds to card">
        <label className="label">Amount</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
          <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))} className="field pl-8 font-display text-xl" placeholder="0.00" />
        </div>
        <p className="mt-2 text-xs text-slate-500">From your balance of {money(account.balance)}</p>
        <button onClick={() => act('fund', { amount })} disabled={busy || !(Number(amount) > 0)} className="btn-dark mt-5 w-full py-3.5">{busy ? <Spinner /> : 'Add funds'}</button>
      </Modal>

      <Modal open={modal === 'terminate'} onClose={() => setModal(null)} title="Close this card?">
        <p className="text-sm text-slate-600">The card will stop working permanently. Any remaining balance ({card ? money(card.balance) : ''}) goes back to your account.</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button onClick={() => setModal(null)} className="btn-ghost">Keep card</button>
          <button onClick={() => act('terminate')} disabled={busy} className="btn-dark bg-red-600 hover:bg-red-700">{busy ? <Spinner /> : 'Close card'}</button>
        </div>
      </Modal>
    </div>
  );
}
