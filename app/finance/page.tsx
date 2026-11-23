'use client';
import React from 'react';
import { useApp } from '@/lib/store/AppContext';
import { receivables, expenses } from '@/lib/data';
import { fmtINRn } from '@/lib/formatters';
import MiniChart from '@/components/ui/MiniChart';

export default function FinancePage() {
  const { rate, showToast } = useApp();
  const rateStr = '₹ ' + rate.toLocaleString('en-IN');

  const cards = [
    { label: 'Cash in Hand', amt: '₹ 3.84 L', accent: '#F0F2F4' },
    { label: 'Bank Balance', amt: '₹ 42.60 L', accent: '#C8D0D8' },
    { label: 'Receivables', amt: '₹ 11.34 L', accent: '#FFC840' },
    { label: 'Payables', amt: '₹ 6.85 L', accent: '#F87171' },
  ];

  const sumR = (f: (r: typeof receivables[0]) => number) => receivables.reduce((a, r) => a + f(r), 0);
  const totals = {
    cur: fmtINRn(sumR(r => r.cur)), d30: fmtINRn(sumR(r => r.d30)),
    d60: fmtINRn(sumR(r => r.d60)), d90: fmtINRn(sumR(r => r.d90)),
    total: fmtINRn(sumR(r => r.total)),
  };

  const rateData = [88.2, 88.9, 89.1, 88.6, 89.4, 89.0, rate / 1000];
  const th = { textAlign: 'left' as const, padding: '9px 16px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '.06em', color: '#8A9099', borderBottom: '1px solid #242428' };

  return (
    <div className="ss-page">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 600, color: '#F0F2F4', letterSpacing: '-.01em' }}>Finance & Accounts</div>
          <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '3px' }}>Cash position, receivables aging & cost structure</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => showToast('Exporting to Tally format…')} style={{ display: 'flex', alignItems: 'center', height: '32px', padding: '0 13px', border: '1px solid #242428', borderRadius: '6px', color: '#C8D0D8', fontWeight: 500, cursor: 'pointer', background: 'transparent' }}>Tally Export</button>
          <button onClick={() => showToast('New voucher form opened')} style={{ display: 'flex', alignItems: 'center', height: '32px', padding: '0 14px', background: '#C8D0D8', color: '#0A0A0B', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', border: 'none' }}>New Voucher</button>
        </div>
      </div>

      {/* Cards */}
      <div className="ss-g4">
        {cards.map(c => (
          <div key={c.label} style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '15px 16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: '#8A9099' }}>{c.label}</div>
            <div style={{ marginTop: '13px', fontFamily: "'JetBrains Mono',monospace", fontSize: '23px', fontWeight: 600, color: c.accent }}>{c.amt}</div>
          </div>
        ))}
      </div>

      <div className="ss-fin-2">
        {/* Receivables aging */}
        <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 17px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: '#8A9099', borderBottom: '1px solid #1C1C20' }}>Receivables Aging</div>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead><tr style={{ background: '#18181C' }}>
                <th style={th}>Client</th>
                <th style={{ ...th, textAlign: 'right' }}>Current</th>
                <th style={{ ...th, textAlign: 'right' }}>31–60</th>
                <th style={{ ...th, textAlign: 'right' }}>61–90</th>
                <th style={{ ...th, textAlign: 'right', color: '#F87171' }}>90+</th>
                <th style={{ ...th, textAlign: 'right', color: '#C8D0D8' }}>Total</th>
              </tr></thead>
              <tbody>
                {receivables.map((r, i) => (
                  <tr key={r.client} style={{ background: i % 2 === 0 ? '#111113' : '#0E0E10' }}>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', color: '#E2E8ED' }}>{r.client}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#C8D0D8' }}>{fmtINRn(r.cur)}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#8A9099' }}>{fmtINRn(r.d30)}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: r.d60 > 0 ? '#FFC840' : '#3a3a40' }}>{fmtINRn(r.d60)}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: r.d90 > 0 ? '#F87171' : '#3a3a40' }}>{fmtINRn(r.d90)}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#F0F2F4', fontWeight: 500 }}>{fmtINRn(r.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr style={{ background: '#18181C' }}>
                <td style={{ padding: '11px 16px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#8A9099', borderTop: '1px solid #242428' }}>Total</td>
                <td style={{ padding: '11px 16px', borderTop: '1px solid #242428', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#C8D0D8', fontWeight: 600 }}>{totals.cur}</td>
                <td style={{ padding: '11px 16px', borderTop: '1px solid #242428', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#8A9099', fontWeight: 600 }}>{totals.d30}</td>
                <td style={{ padding: '11px 16px', borderTop: '1px solid #242428', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#FFC840', fontWeight: 600 }}>{totals.d60}</td>
                <td style={{ padding: '11px 16px', borderTop: '1px solid #242428', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#F87171', fontWeight: 600 }}>{totals.d90}</td>
                <td style={{ padding: '11px 16px', borderTop: '1px solid #242428', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#F0F2F4', fontWeight: 600 }}>{totals.total}</td>
              </tr></tfoot>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Expense breakdown */}
          <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '15px 17px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: '#8A9099', marginBottom: '14px' }}>Expense Breakdown</div>
            {expenses.map(e => (
              <div key={e.cat} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '12px', color: '#C8D0D8' }}>{e.cat}</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', color: '#8A9099' }}>{fmtINRn(e.amt)}</span>
                </div>
                <div style={{ height: '5px', background: '#18181C', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#C8D0D8', borderRadius: '3px', width: e.pct + '%' }} />
                </div>
              </div>
            ))}
          </div>
          {/* Rate chart */}
          <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '15px 17px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: '#8A9099' }}>MCX Silver · 7d</div>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', color: '#4ADE80' }}>{rateStr}</span>
            </div>
            <div style={{ height: '90px' }}><MiniChart data={rateData} color="#C8D0D8" height={90} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
