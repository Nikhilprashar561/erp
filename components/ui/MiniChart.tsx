'use client';
import React from 'react';

interface MiniChartProps {
  data: number[];
  color: string;
  height: number;
  type?: 'area' | 'bar';
  secondData?: number[];
  secondColor?: string;
}

export default function MiniChart({ data, color, height, type = 'area', secondData, secondColor }: MiniChartProps) {
  const W = 420;
  const H = height;
  const n = data.length;
  const max = Math.max(...data, ...(secondData || [])) * 1.1 || 1;

  if (type === 'bar') {
    const bw = W / n - 3;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
        {data.map((v, i) => {
          const bh = (v / max) * (H - 4);
          return <rect key={i} x={i * (W / n) + 1.5} y={H - bh} width={bw} height={bh} rx={1} fill={color} />;
        })}
      </svg>
    );
  }

  const pts = data.map((v, i) => [(i / (n - 1)) * W, H - 2 - (v / max) * (H - 8)] as [number, number]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = line + ` L ${W} ${H} L 0 ${H} Z`;

  let secondLine = '';
  if (secondData && secondColor) {
    const spts = secondData.map((v, i) => [(i / (secondData.length - 1)) * W, H - 2 - (v / max) * (H - 8)] as [number, number]);
    secondLine = spts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  }

  const gradId = 'g' + color.replace('#', '');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.22} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      {secondLine && <path d={secondLine} fill="none" stroke={secondColor} strokeWidth={1.3} />}
      <path d={line} fill="none" stroke={color} strokeWidth={1.6} />
    </svg>
  );
}
