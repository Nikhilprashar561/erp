'use client';
import React, { useState, useEffect } from 'react';
import { useLedgerStore } from '@/stores/useLedgerStore';
import { useUIStore } from '@/stores/useUIStore';
import { fmtGn, fmtINRn } from '@/lib/formatters';
import RecordPaymentModal from '@/components/ledger/RecordPaymentModal';

const tint: Record<string, string> = {
  'Silver Rcvd': '#4ADE80',
  'Silver Issue': '#F87171',
  'Job Out': '#F87171',
  'Job In': '#4ADE80',
  'Dispatch': '#C8D0D8',
  'Payment': '#60A5FA',
  'Opening': '#8A9099',
};

export default function LedgerPage() {
  const { entries, isLoading, fetchLedger, exportCsv } = useLedgerStore();
  const showToast = useUIStore((s) => s.showToast);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  const rows = [...entries].reverse().map((e, i) => ({
    ...e,
    typeColor: tint[e.type] || '#C8D0D8',
    sInFmt: e.sIn ? fmtGn(e.sIn) : '—',
    sOutFmt: e.sOut ? fmtGn(e.sOut) : '—',
    sBalFmt: fmtGn(e.sBal),
    iInFmt: e.iIn ? fmtINRn(e.iIn) : '—',
    iOutFmt: e.iOut ? fmtINRn(e.iOut) : '—',
    iBalFmt: fmtINRn(e.iBal),
    sInColor: e.sIn ? '#4ADE80' : '#3a3a40',
    sOutColor: e.sOut ? '#F87171' : '#3a3a40',
    iInColor: e.iIn ? '#C8D0D8' : '#3a3a40',
    iOutColor: e.iOut ? '#C8D0D8' : '#3a3a40',
    rowBg: i % 2 === 0 ? '#111113' : '#0E0E10',
  }));

  const lastEntry = entries.length > 0 ? entries[entries.length - 1] : null;
  const lTot = {
    sIn: fmtGn(entries.reduce((a, e) => a + (e.sIn || 0), 0)),
    sOut: fmtGn(entries.reduce((a, e) => a + (e.sOut || 0), 0)),
    sClose: fmtGn(lastEntry ? lastEntry.sBal : 0),
    iIn: fmtINRn(entries.reduce((a, e) => a + (e.iIn || 0), 0)),
    iOut: fmtINRn(entries.reduce((a, e) => a + (e.iOut || 0), 0)),
    iClose: fmtINRn(lastEntry ? lastEntry.iBal : 0),
  };

  const th = {
    position: 'sticky' as const,
    top: 0,
    background: '#18181C',
    textAlign: 'left' as const,
    padding: '11px 14px',
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '.07em',
    color: '#8A9099',
    borderBottom: '1px solid #242428',
    whiteSpace: 'nowrap' as const,
  };

  return (
    <div className="ss-page">
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '18px',
        }}
      >
        <div>
          <div style={{ fontSize: '22px', fontWeight: 600, color: '#F0F2F4', letterSpacing: '-.01em' }}>
            Silver Ledger
          </div>
          <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '3px' }}>
            Dual ledger · silver &amp; INR running simultaneously · all parties
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsRecordPaymentOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              height: '32px',
              padding: '0 13px',
              border: '1px solid #242428',
              borderRadius: '6px',
              color: '#C8D0D8',
              fontWeight: 500,
              cursor: 'pointer',
              background: 'transparent',
            }}
          >
            <span style={{ color: '#8A9099' }}>+</span> Record Payment
          </button>
          <button
            onClick={() => {
              exportCsv();
              showToast('Ledger exported to CSV');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              height: '32px',
              padding: '0 14px',
              background: '#C8D0D8',
              color: '#0A0A0B',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
            }}
          >
            Export Ledger
          </button>
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
                <th style={{ ...th, textAlign: 'right', borderLeft: '1px solid #242428', color: '#8A9099' }}>
                  Silver In
                </th>
                <th style={{ ...th, textAlign: 'right' }}>Silver Out</th>
                <th style={{ ...th, textAlign: 'right', color: '#C8D0D8' }}>Silver Bal</th>
                <th style={{ ...th, textAlign: 'right', borderLeft: '1px solid #242428' }}>INR In</th>
                <th style={{ ...th, textAlign: 'right' }}>INR Out</th>
                <th style={{ ...th, textAlign: 'right', color: '#C8D0D8' }}>INR Bal</th>
                <th style={th}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && entries.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '36px', color: '#8A9099' }}>
                    Loading dual ledger transactions...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '36px', color: '#8A9099' }}>
                    No ledger transactions recorded yet.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={r.id || i} style={{ background: r.rowBg }}>
                    <td
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid #1C1C20',
                        fontFamily: "'JetBrains Mono',monospace",
                        color: '#8A9099',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {r.date}
                    </td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 500, color: r.typeColor }}>{r.type}</span>
                    </td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', color: '#C8D0D8', whiteSpace: 'nowrap' }}>
                      {r.party}
                    </td>
                    <td
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid #1C1C20',
                        fontFamily: "'JetBrains Mono',monospace",
                        color: '#8A9099',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {r.ref}
                    </td>
                    <td
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid #1C1C20',
                        borderLeft: '1px solid #1C1C20',
                        fontFamily: "'JetBrains Mono',monospace",
                        fontVariantNumeric: 'tabular-nums',
                        textAlign: 'right',
                        whiteSpace: 'nowrap',
                        color: r.sInColor,
                      }}
                    >
                      {r.sInFmt}
                    </td>
                    <td
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid #1C1C20',
                        fontFamily: "'JetBrains Mono',monospace",
                        fontVariantNumeric: 'tabular-nums',
                        textAlign: 'right',
                        whiteSpace: 'nowrap',
                        color: r.sOutColor,
                      }}
                    >
                      {r.sOutFmt}
                    </td>
                    <td
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid #1C1C20',
                        fontFamily: "'JetBrains Mono',monospace",
                        fontVariantNumeric: 'tabular-nums',
                        textAlign: 'right',
                        whiteSpace: 'nowrap',
                        color: '#F0F2F4',
                        fontWeight: 500,
                      }}
                    >
                      {r.sBalFmt}
                    </td>
                    <td
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid #1C1C20',
                        borderLeft: '1px solid #1C1C20',
                        fontFamily: "'JetBrains Mono',monospace",
                        fontVariantNumeric: 'tabular-nums',
                        textAlign: 'right',
                        whiteSpace: 'nowrap',
                        color: r.iInColor,
                      }}
                    >
                      {r.iInFmt}
                    </td>
                    <td
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid #1C1C20',
                        fontFamily: "'JetBrains Mono',monospace",
                        fontVariantNumeric: 'tabular-nums',
                        textAlign: 'right',
                        whiteSpace: 'nowrap',
                        color: r.iOutColor,
                      }}
                    >
                      {r.iOutFmt}
                    </td>
                    <td
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid #1C1C20',
                        fontFamily: "'JetBrains Mono',monospace",
                        fontVariantNumeric: 'tabular-nums',
                        textAlign: 'right',
                        whiteSpace: 'nowrap',
                        color: '#F0F2F4',
                        fontWeight: 500,
                      }}
                    >
                      {r.iBalFmt}
                    </td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', color: '#8A9099', whiteSpace: 'nowrap' }}>
                      {r.note}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr style={{ background: '#18181C' }}>
                <td
                  colSpan={4}
                  style={{
                    padding: '12px 14px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '.07em',
                    color: '#8A9099',
                    borderTop: '1px solid #242428',
                  }}
                >
                  Closing Position
                </td>
                <td
                  style={{
                    padding: '12px 14px',
                    borderTop: '1px solid #242428',
                    borderLeft: '1px solid #242428',
                    fontFamily: "'JetBrains Mono',monospace",
                    textAlign: 'right',
                    color: '#4ADE80',
                    fontWeight: 600,
                  }}
                >
                  {lTot.sIn}
                </td>
                <td
                  style={{
                    padding: '12px 14px',
                    borderTop: '1px solid #242428',
                    fontFamily: "'JetBrains Mono',monospace",
                    textAlign: 'right',
                    color: '#F87171',
                    fontWeight: 600,
                  }}
                >
                  {lTot.sOut}
                </td>
                <td
                  style={{
                    padding: '12px 14px',
                    borderTop: '1px solid #242428',
                    fontFamily: "'JetBrains Mono',monospace",
                    textAlign: 'right',
                    color: '#F0F2F4',
                    fontWeight: 600,
                  }}
                >
                  {lTot.sClose}
                </td>
                <td
                  style={{
                    padding: '12px 14px',
                    borderTop: '1px solid #242428',
                    borderLeft: '1px solid #242428',
                    fontFamily: "'JetBrains Mono',monospace",
                    textAlign: 'right',
                    color: '#C8D0D8',
                    fontWeight: 600,
                  }}
                >
                  {lTot.iIn}
                </td>
                <td
                  style={{
                    padding: '12px 14px',
                    borderTop: '1px solid #242428',
                    fontFamily: "'JetBrains Mono',monospace",
                    textAlign: 'right',
                    color: '#C8D0D8',
                    fontWeight: 600,
                  }}
                >
                  {lTot.iOut}
                </td>
                <td
                  style={{
                    padding: '12px 14px',
                    borderTop: '1px solid #242428',
                    fontFamily: "'JetBrains Mono',monospace",
                    textAlign: 'right',
                    color: '#F0F2F4',
                    fontWeight: 600,
                  }}
                >
                  {lTot.iClose}
                </td>
                <td style={{ borderTop: '1px solid #242428' }} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
      />
    </div>
  );
}
