'use client';
import React, { useState } from 'react';
import { useApp } from '@/lib/store/AppContext';
import { silverLoc } from '@/lib/data';
import { fmtGn, statusMeta, chipStyle } from '@/lib/formatters';

const S = statusMeta;
type Filter = 'All' | 'Factory' | 'Karigar' | 'Job Worker';

export default function WhereSilverPage() {
  const { showToast } = useApp();
  const [filter, setFilter] = useState<Filter>('All');

  const filtered = filter === 'All' ? silverLoc : silverLoc.filter(l => l.type.includes(filter === 'Job Worker' ? 'Job' : filter));

  const tFac = silverLoc.filter(l => l.type === 'Factory').reduce((a, l) => a + l.amt, 0);
  const tKar = silverLoc.filter(l => l.type === 'Karigar').reduce((a, l) => a + l.amt, 0);
  const tJob = silverLoc.filter(l => l.type === 'Job Worker').reduce((a, l) => a + l.amt, 0);
  const tDis = silverLoc.filter(l => l.type.includes('Client')).reduce((a, l) => a + l.amt, 0);

  const cards = [
    { label: 'Total Silver in System', amt: fmtGn(tFac + tKar + tJob + tDis), accent: '#F0F2F4' },
    { label: 'In Factory Stock', amt: fmtGn(tFac), accent: '#C8D0D8' },
    { label: 'With Karigars', amt: fmtGn(tKar), accent: '#C8D0D8' },
    { label: 'At Job Workers', amt: fmtGn(tJob), accent: '#C8D0D8' },
    { label: 'Dispatched · Unbilled', amt: fmtGn(tDis), accent: '#FFC840' },
  ];

  const locColor = (a: number) => a >= 30 ? '#F87171' : a >= 15 ? '#FFC840' : '#C8D0D8';
  const th = { textAlign: 'left' as const, padding: '10px 16px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '.07em', color: '#8A9099', borderBottom: '1px solid #242428' };
  const filters: Filter[] = ['All', 'Factory', 'Karigar', 'Job Worker'];

  return (
    <div className="ss-page">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '22px', fontWeight: 600, color: '#F0F2F4', letterSpacing: '-.01em' }}>Where Is My Silver?</div>
            <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.08em', color: '#C8D0D8', border: '1px solid #33333a', borderRadius: '4px', padding: '2px 7px' }}>LIVE TRACE</span>
          </div>
          <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '4px' }}>Every gram of silver in the system, by location · aging tracked</div>
        </div>
        <button onClick={() => showToast('Stock reconciliation started…')} style={{ display: 'flex', alignItems: 'center', height: '32px', padding: '0 14px', background: '#C8D0D8', color: '#0A0A0B', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', border: 'none' }}>Reconcile Stock</button>
      </div>

      {/* Summary cards */}
      <div className="ss-g5">
        {cards.map(c => (
          <div key={c.label} style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '15px 16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: '#8A9099' }}>{c.label}</div>
            <div style={{ marginTop: '14px', fontFamily: "'JetBrains Mono',monospace", fontVariantNumeric: 'tabular-nums', fontSize: '23px', fontWeight: 600, letterSpacing: '-.02em', color: c.accent }}>{c.amt} g</div>
          </div>
        ))}
      </div>

      {/* Location table */}
      <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 17px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1C1C20' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: '#8A9099' }}>Location Breakdown</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ fontSize: '11px', color: filter === f ? '#E2E8ED' : '#8A9099', border: '1px solid', borderColor: filter === f ? '#33333a' : '#1C1C20', background: filter === f ? '#18181C' : 'transparent', borderRadius: '5px', padding: '4px 9px', cursor: 'pointer' }}>{f}</button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead><tr style={{ background: '#18181C' }}>
              <th style={th}>Location Type</th>
              <th style={th}>Party</th>
              <th style={{ ...th, textAlign: 'right' }}>Silver Held</th>
              <th style={th}>Since</th>
              <th style={{ ...th, textAlign: 'right' }}>Aging</th>
              <th style={th}>Status</th>
              <th style={{ ...th, textAlign: 'right' }}>Action</th>
            </tr></thead>
            <tbody>
              {filtered.map((l, i) => {
                const statusKey = l.aging >= 30 ? 'overdue' : l.aging >= 15 ? 'qc' : l.type === 'Factory' ? 'dispatched' : 'completed';
                const statusLabel = l.aging >= 30 ? 'Alert' : l.aging >= 15 ? 'Watch' : l.type === 'Factory' ? 'Secured' : 'Normal';
                return (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#111113' : '#0E0E10' }}>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', color: '#C8D0D8' }}>{l.type}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', color: '#E2E8ED' }}>{l.party}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", fontVariantNumeric: 'tabular-nums', textAlign: 'right', color: '#F0F2F4' }}>{fmtGn(l.amt)} g</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", color: '#8A9099' }}>{l.since}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: locColor(l.aging) }}>{l.aging === 0 ? '—' : l.aging + ' days'}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', height: '19px', padding: '0 7px', borderRadius: '4px', fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em', background: statusMeta[statusKey]?.bg, color: statusMeta[statusKey]?.fg }}>{statusLabel}</span>
                    </td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', textAlign: 'right' }}>
                      <button onClick={() => showToast(`Tracing silver at ${l.party}…`)} style={{ fontSize: '11px', color: '#60A5FA', cursor: 'pointer', background: 'transparent', border: 'none' }}>Trace →</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
