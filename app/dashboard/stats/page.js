'use client';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { money, txLabel } from '@/lib/format';
import Icon from '@/components/ui/Icon';
import FlowChart from '@/components/ui/FlowChart';
import { useBank } from '@/components/dashboard/BankProvider';
import { PageHeader, Skeleton, Empty } from '@/components/dashboard/bits';

const RANGES = [7, 14, 30];

export default function StatsPage() {
  const { account } = useBank();
  const [range, setRange] = useState(14);
  const [rows, setRows] = useState(null);

  useEffect(() => {
    const since = new Date(Date.now() - 30 * 864e5).toISOString();
    createClient()
      .from('transactions')
      .select('type,direction,amount,status,created_at')
      .eq('account_id', account.id)
      .eq('status', 'completed')
      .gte('created_at', since)
      .then(({ data }) => setRows(data || []));
  }, [account.id, account.balance]);

  const { series, totalIn, totalOut, byType } = useMemo(() => {
    const days = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 864e5);
      days.push({ day: d.toLocaleDateString('en-CA'), inflow: 0, outflow: 0 });
    }
    const index = Object.fromEntries(days.map((d, i) => [d.day, i]));
    let tin = 0, tout = 0;
    const types = {};
    (rows || []).forEach((t) => {
      const day = new Date(t.created_at).toLocaleDateString('en-CA');
      if (!(day in index)) return;
      const amt = Number(t.amount);
      if (t.direction === 'credit') { days[index[day]].inflow += amt; tin += amt; }
      else { days[index[day]].outflow += amt; tout += amt; }
      types[t.type] = (types[t.type] || 0) + amt;
    });
    return { series: days, totalIn: tin, totalOut: tout, byType: Object.entries(types).sort((a, b) => b[1] - a[1]) };
  }, [rows, range]);

  const maxType = byType[0]?.[1] || 1;

  return (
    <div>
      <PageHeader
        title="Stats"
        subtitle="Where your money came from and where it went."
        action={
          <div className="flex gap-1 rounded-xl bg-white p-1 shadow-soft">
            {RANGES.map((r) => (
              <button key={r} onClick={() => setRange(r)} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${range === r ? 'bg-ink-900 text-white' : 'text-slate-500'}`}>
                {r}d
              </button>
            ))}
          </div>
        }
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: 'Money in', value: totalIn, icon: 'down', tone: 'bg-brand-50 text-brand-600' },
          { label: 'Money out', value: totalOut, icon: 'upRight', tone: 'bg-amber-50 text-amber-600' },
          { label: 'Net', value: totalIn - totalOut, icon: 'chart', tone: 'bg-slate-100 text-slate-700' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="panel flex items-center gap-3 p-4">
            <span className={`grid h-11 w-11 place-items-center rounded-xl ${s.tone}`}><Icon name={s.icon} size={20} /></span>
            <div>
              <p className="text-xs text-slate-500">{s.label} · last {range} days</p>
              <p className="font-display text-xl font-semibold tabular-nums">{money(s.value)}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <section className="panel p-5">
          <h2 className="mb-3 font-semibold">Daily cash flow</h2>
          {rows === null ? <Skeleton className="h-60" /> : <FlowChart data={series} />}
        </section>
        <section className="panel p-5">
          <h2 className="mb-4 font-semibold">By category</h2>
          {rows !== null && byType.length === 0 && <Empty icon="chart" title="No activity yet" />}
          <div className="space-y-4">
            {byType.map(([type, amt]) => (
              <div key={type}>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">{txLabel[type]}</span>
                  <span className="font-semibold tabular-nums">{money(amt)}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                  <motion.div className="h-full rounded-full bg-ink-700" initial={{ width: 0 }} animate={{ width: `${(amt / maxType) * 100}%` }} transition={{ duration: 0.8 }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
