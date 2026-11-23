'use client';
import React, { useState } from 'react';
import { useApp } from '@/lib/store/AppContext';
import { ledger as initialLedger } from '@/lib/data';
import { fmtGn, fmtINRn } from '@/lib/formatters';

const tint: Record<string, string> = {
  'Silver Rcvd': '#4ADE80', 'Silver Issue': '#F87171', 'Job Out': '#F87171',
  'Job In': '#4ADE80', 'Dispatch': '#C8D0D8', 'Payment': '#60A5FA', 'Opening': '#8A9099',
};

export default function LedgerPage() {
  const { showToast } = useApp();
  const [ledger, setLedger] = useState(initialLedger);

  let sBal = 0, iBal = 0;
  const lc = ledger.map(e => { sBal += e.sIn - e.sOut; iBal += e.iIn - e.iOut; return { ...e, sBalV: sBal, iBalV: iBal }; });

  const rows = [...lc].reverse().map((e, i) => ({
    ...e,
    typeColor: tint[e.type] || '#C8D0D8',
    sIn: e.sIn ? fmtGn(e.sIn) : '—', sOut: e.sOut ? fmtGn(e.sOut) : '—', sBal: fmtGn(e.sBalV),
    iIn: e.iIn ? fmtINRn(e.iIn) : '—', iOut: e.iOut ? fmtINRn(e.iOut) : '—', iBal: fmtINRn(e.iBalV),
    sInColor: e.sIn ? '#4ADE80' : '#3a3a40', sOutColor: e.sOut ? '#F87171' : '#3a3a40',
    iInColor: e.iIn ? '#C8D0D8' : '#3a3a40', iOutColor: e.iOut ? '#C8D0D8' : '#3a3a40',
    rowBg: i % 2 === 0 ? '#111113' : '#0E0E10',
  }));

  const lTot = {
    sIn: fmtGn(lc.reduce((a, e) => a + e.sIn, 0)),
    sOut: fmtGn(lc.reduce((a, e) => a + e.sOut, 0)),
    sClose: fmtGn(sBal),
    iIn: fmtINRn(lc.reduce((a, e) => a + e.iIn, 0)),
    iOut: fmtINRn(lc.reduce((a, e) => a + e.iOut, 0)),
    iClose: fmtINRn(iBal),
  };

  const th = { position: 'sticky' as const, top: 0, background: '#18181C', textAlign: 'left' as const, padding: '11px 14px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '.07em', color: '#8A9099', borderBottom: '1px solid #242428', whiteSpace: 'nowrap' as const };

  return (
    <div className="ss-page">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 600, color: '#F0F2F4', letterSpacing: '-.01em' }}>Silver Ledger</div>
          <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '3px' }}>Dual ledger · silver &amp; INR running simultaneously · all parties</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => showToast('Payment ₹ 1,00,000 recorded · ledger updated')} style={{ display: 'flex', alignItems: 'center', gap: '7px', height: '32px', padding: '0 13px', border: '1px solid #242428', borderRadius: '6px', color: '#C8D0D8', fontWeight: 500, cursor: 'pointer', background: 'transparent' }}><span style={{ color: '#8A9099' }}>+</span> Record Payment</button>
          <button onClick={() => showToast('Ledger exported to CSV')} style={{ display: 'flex', alignItems: 'center', height: '32px', padding: '0 14px', background: '#C8D0D8', color: '#0A0A0B', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', border: 'none' }}>Export Ledger</button>
        </div>
      </div>

      <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '1080px' }}>
            <thead>
              <tr>
                <th style={th}>Date</th>
                <th style={th}>Type</th>
                <th style={th}>Party</th>
                <th style={th}>Order Ref</th>
                <th style={{ ...th, textAlign: 'right', borderLeft: '1px solid #242428', color: '#8A9099' }}>Silver In</th>
                <th style={{ ...th, textAlign: 'right' }}>Silver Out</th>
                <th style={{ ...th, textAlign: 'right', color: '#C8D0D8' }}>Silver Bal</th>
                <th style={{ ...th, textAlign: 'right', borderLeft: '1px solid #242428' }}>INR In</th>
                <th style={{ ...th, textAlign: 'right' }}>INR Out</th>
                <th style={{ ...th, textAlign: 'right', color: '#C8D0D8' }}>INR Bal</th>
                <th style={th}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} style={{ background: r.rowBg }}>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", color: '#8A9099', whiteSpace: 'nowrap' }}>{r.date}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', whiteSpace: 'nowrap' }}><span style={{ fontWeight: 500, color: r.typeColor }}>{r.type}</span></td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', color: '#C8D0D8', whiteSpace: 'nowrap' }}>{r.party}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", color: '#8A9099', whiteSpace: 'nowrap' }}>{r.ref}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', borderLeft: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", fontVariantNumeric: 'tabular-nums', textAlign: 'right', whiteSpace: 'nowrap', color: r.sInColor }}>{r.sIn}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", fontVariantNumeric: 'tabular-nums', textAlign: 'right', whiteSpace: 'nowrap', color: r.sOutColor }}>{r.sOut}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", fontVariantNumeric: 'tabular-nums', textAlign: 'right', whiteSpace: 'nowrap', color: '#F0F2F4', fontWeight: 500 }}>{r.sBal}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', borderLeft: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", fontVariantNumeric: 'tabular-nums', textAlign: 'right', whiteSpace: 'nowrap', color: r.iInColor }}>{r.iIn}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", fontVariantNumeric: 'tabular-nums', textAlign: 'right', whiteSpace: 'nowrap', color: r.iOutColor }}>{r.iOut}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", fontVariantNumeric: 'tabular-nums', textAlign: 'right', whiteSpace: 'nowrap', color: '#F0F2F4', fontWeight: 500 }}>{r.iBal}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', color: '#8A9099', whiteSpace: 'nowrap' }}>{r.note}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#18181C' }}>
                <td colSpan={4} style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: '#8A9099', borderTop: '1px solid #242428' }}>Closing Position</td>
                <td style={{ padding: '12px 14px', borderTop: '1px solid #242428', borderLeft: '1px solid #242428', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#4ADE80', fontWeight: 600 }}>{lTot.sIn}</td>
                <td style={{ padding: '12px 14px', borderTop: '1px solid #242428', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#F87171', fontWeight: 600 }}>{lTot.sOut}</td>
                <td style={{ padding: '12px 14px', borderTop: '1px solid #242428', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#F0F2F4', fontWeight: 600 }}>{lTot.sClose}</td>
                <td style={{ padding: '12px 14px', borderTop: '1px solid #242428', borderLeft: '1px solid #242428', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#C8D0D8', fontWeight: 600 }}>{lTot.iIn}</td>
                <td style={{ padding: '12px 14px', borderTop: '1px solid #242428', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#C8D0D8', fontWeight: 600 }}>{lTot.iOut}</td>
                <td style={{ padding: '12px 14px', borderTop: '1px solid #242428', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#F0F2F4', fontWeight: 600 }}>{lTot.iClose}</td>
                <td style={{ borderTop: '1px solid #242428' }} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
