'use client';
import React from 'react';
import { useApp } from '@/lib/store/AppContext';
import { movements } from '@/lib/data';
import { fmtGn } from '@/lib/formatters';

const moveType: Record<string, string> = { Receipt: '#4ADE80', Issue: '#F87171', Transfer: '#60A5FA', Return: '#4ADE80', Dispatch: '#C084FC' };

export default function MovementPage() {
  const { showToast } = useApp();
  const cards = [
    { label: 'Received Today', amt: '830.000 g', accent: '#4ADE80' },
    { label: 'Issued Today', amt: '662.000 g', accent: '#F87171' },
    { label: 'Transfers Today', amt: '520.000 g', accent: '#60A5FA' },
    { label: 'Net Movement', amt: '+168.000 g', accent: '#F0F2F4' },
  ];
  const th = { textAlign: 'left' as const, padding: '10px 16px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '.06em', color: '#8A9099', borderBottom: '1px solid #242428' };

  return (
    <div className="ss-page">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 600, color: '#F0F2F4', letterSpacing: '-.01em' }}>Material Movement</div>
          <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '3px' }}>Every silver transfer · receipts, issues, returns & dispatch</div>
        </div>
        <button onClick={() => showToast('Movement record form opened')} style={{ display: 'flex', alignItems: 'center', height: '32px', padding: '0 14px', background: '#C8D0D8', color: '#0A0A0B', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', border: 'none' }}>+ Record Movement</button>
      </div>
      <div className="ss-g4">
        {cards.map(c => (
          <div key={c.label} style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: '#8A9099' }}>{c.label}</div>
            <div style={{ marginTop: '13px', fontFamily: "'JetBrains Mono',monospace", fontSize: '21px', fontWeight: 600, color: c.accent }}>{c.amt}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead><tr style={{ background: '#18181C' }}>
              <th style={th}>Timestamp</th><th style={th}>Type</th><th style={th}>From</th><th style={th}>To</th>
              <th style={th}>Reference</th><th style={{ ...th, textAlign: 'right' }}>Fine Wt</th><th style={th}>By</th>
            </tr></thead>
            <tbody>
              {movements.map((m, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#111113' : '#0E0E10' }}>
                  <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", color: '#8A9099' }}>{m.date}</td>
                  <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20' }}><span style={{ fontWeight: 500, color: moveType[m.type] || '#C8D0D8' }}>{m.type}</span></td>
                  <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', color: '#C8D0D8' }}>{m.from}</td>
                  <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', color: '#C8D0D8' }}>{m.to}</td>
                  <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", color: '#8A9099' }}>{m.ref}</td>
                  <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#F0F2F4' }}>{fmtGn(m.wt)} g</td>
                  <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', color: '#8A9099' }}>{m.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
