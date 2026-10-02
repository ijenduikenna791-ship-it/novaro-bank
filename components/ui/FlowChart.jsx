'use client';
import { useEffect, useRef, useState } from 'react';
import { compactMoney, money } from '@/lib/format';

const IN = '#5b6ce0';
const OUT = '#e0913a';

/**
 * Grouped bar chart of daily money in vs money out.
 * data: [{ day: 'YYYY-MM-DD', inflow: number, outflow: number }]
 */
export default function FlowChart({ data = [], height = 240 }) {
  const ref = useRef(null);
  const [width, setWidth] = useState(600);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const pad = { l: 44, r: 8, t: 12, b: 26 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const max = Math.max(1, ...data.flatMap((d) => [Number(d.inflow), Number(d.outflow)]));
  const nice = Math.pow(10, Math.floor(Math.log10(max)));
  const top = Math.ceil(max / nice) * nice;
  const ticks = [0, top / 2, top];
  const band = w / Math.max(1, data.length);
  const bar = Math.max(3, Math.min(14, (band - 8) / 2));
  const y = (v) => pad.t + h - (Number(v) / top) * h;
  const labelEvery = width < 480 ? Math.ceil(data.length / 5) : Math.ceil(data.length / 10);
  const fmtDay = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const barPath = (x, v) => {
    const yy = y(v);
    const hh = pad.t + h - yy;
    if (hh <= 0.5) return '';
    const r = Math.min(4, hh, bar / 2);
    return `M${x},${pad.t + h} V${yy + r} Q${x},${yy} ${x + r},${yy} H${x + bar - r} Q${x + bar},${yy} ${x + bar},${yy + r} V${pad.t + h} Z`;
  };

  const hovered = hover !== null ? data[hover] : null;

  return (
    <div>
      <div className="mb-3 flex items-center gap-4 text-xs text-slate-600">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: IN }} /> Money in</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: OUT }} /> Money out</span>
      </div>
      <div ref={ref} className="relative w-full overflow-hidden">
        <svg width={width} height={height} role="img" aria-label="Daily money in and out" className="block">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} stroke="#e8ebf2" strokeDasharray={t === 0 ? '' : '3 4'} />
              <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#94a3b8">{compactMoney(t)}</text>
            </g>
          ))}
          {data.map((d, i) => {
            const x0 = pad.l + i * band + (band - (bar * 2 + 2)) / 2;
            return (
              <g key={d.day}>
                {hover === i && <rect x={pad.l + i * band + 1} y={pad.t} width={band - 2} height={h} rx="6" fill="#f1f3f9" />}
                <path d={barPath(x0, d.inflow)} fill={IN} />
                <path d={barPath(x0 + bar + 2, d.outflow)} fill={OUT} />
                {i % labelEvery === 0 && (
                  <text x={pad.l + i * band + band / 2} y={height - 6} textAnchor="middle" fontSize="11" fill="#94a3b8">{fmtDay(d.day)}</text>
                )}
                <rect
                  x={pad.l + i * band}
                  y={pad.t}
                  width={band}
                  height={h + pad.b}
                  fill="transparent"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onTouchStart={() => setHover(i)}
                />
              </g>
            );
          })}
        </svg>
        {hovered && (
          <div
            className="pointer-events-none absolute top-0 z-10 w-40 rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-lg"
            style={{ left: Math.min(width - 168, Math.max(0, pad.l + hover * band + band / 2 - 80)) }}
          >
            <p className="font-semibold text-slate-900">{fmtDay(hovered.day)}</p>
            <p className="mt-1 flex items-center justify-between text-slate-600"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ background: IN }} />In</span><span className="font-medium text-slate-900">{money(hovered.inflow)}</span></p>
            <p className="mt-0.5 flex items-center justify-between text-slate-600"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ background: OUT }} />Out</span><span className="font-medium text-slate-900">{money(hovered.outflow)}</span></p>
          </div>
        )}
      </div>
    </div>
  );
}
