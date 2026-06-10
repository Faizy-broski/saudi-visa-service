'use client';

interface Bar { label: string; value: number }

export default function AdminBarChart({ data, color = '#3CA5D4' }: { data: Bar[]; color?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const W = 560; const H = 140; const BAR_W = 36; const GAP = 12;
  const total = data.length;
  const slotW = (W - GAP) / total;

  return (
    <svg viewBox={`0 0 ${W} ${H + 28}`} className="w-full" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
        <line
          key={pct}
          x1={0} y1={H * (1 - pct)} x2={W} y2={H * (1 - pct)}
          stroke="#eef2f7" strokeWidth={1}
        />
      ))}
      {data.map((d, i) => {
        const bh = max > 0 ? (d.value / max) * H : 0;
        const x = i * slotW + (slotW - BAR_W) / 2;
        const y = H - bh;
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={BAR_W} height={bh} rx={6} fill="url(#bar-grad)" />
            {d.value > 0 && (
              <text x={x + BAR_W / 2} y={y - 6} textAnchor="middle" fontSize={10} fontWeight={700} fill={color}>
                {d.value}
              </text>
            )}
            <text x={x + BAR_W / 2} y={H + 18} textAnchor="middle" fontSize={9} fill="#9ca3af">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
