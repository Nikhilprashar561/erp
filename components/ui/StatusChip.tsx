'use client';
import React from 'react';
import { statusMeta, chipStyle } from '@/lib/formatters';

interface StatusChipProps {
  status: string;
  pulse?: boolean;
}

export default function StatusChip({ status, pulse }: StatusChipProps) {
  const meta = statusMeta[status] ?? { label: status, bg: 'rgba(138,144,153,.16)', fg: '#C8D0D8', pulse: false };
  const shouldPulse = pulse ?? meta.pulse;
  return (
    <span style={chipStyle(meta)}>
      {shouldPulse && (
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: meta.fg, animation: 'ssPulse 2s infinite', flexShrink: 0 }} />
      )}
      {meta.label}
    </span>
  );
}
