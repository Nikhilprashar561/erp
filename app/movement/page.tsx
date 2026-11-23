'use client';
import React, { useEffect, useState } from 'react';
import { useMovementStore } from '@/stores/useMovementStore';
import { fmtGn } from '@/lib/formatters';
import RecordMovementModal from '@/components/movement/RecordMovementModal';

const moveType: Record<string, string> = {
  Receipt: '#4ADE80',
  Issue: '#F87171',
  Transfer: '#60A5FA',
  Return: '#4ADE80',
  Dispatch: '#C084FC',
};

export default function MovementPage() {
  const { movements, fetchMovements, isLoading } = useMovementStore();
  const [isRecordMovementOpen, setIsRecordMovementOpen] = useState(false);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  const rcvd = movements
    .filter((m) => m.type.toLowerCase() === 'receipt' || m.type.toLowerCase() === 'return')
    .reduce((a, m) => a + m.wt, 0);
  const issued = movements
    .filter((m) => m.type.toLowerCase() === 'issue' || m.type.toLowerCase() === 'dispatch')
    .reduce((a, m) => a + m.wt, 0);
  const transfers = movements
    .filter((m) => m.type.toLowerCase() === 'transfer')
    .reduce((a, m) => a + m.wt, 0);
  const net = rcvd - issued;

  const cards = [
    { label: 'Received (Shift)', amt: fmtGn(rcvd) + ' g', accent: '#4ADE80' },
    { label: 'Issued / Dispatched', amt: fmtGn(issued) + ' g', accent: '#F87171' },
    { label: 'Internal Transfers', amt: fmtGn(transfers) + ' g', accent: '#60A5FA' },
    { label: 'Net Movement', amt: `${net >= 0 ? '+' : ''}${fmtGn(net)} g`, accent: '#F0F2F4' },
  ];

  const th = {
    textAlign: 'left' as const,
    padding: '10px 16px',
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '.06em',
    color: '#8A9099',
    borderBottom: '1px solid #242428',
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
            Material Movement
          </div>
          <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '3px' }}>
            {isLoading && movements.length === 0
              ? 'Loading silver transfer logs...'
              : `${movements.length} logged transfers · receipts, issues, returns & dispatch`}
          </div>
        </div>
        <button
          onClick={() => setIsRecordMovementOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            height: '32px',
            padding: '0 14px',
            background: '#C8D0D8',
            color: '#0A0A0B',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            fontSize: '12px',
          }}
        >
          <span style={{ fontSize: '14px', marginTop: '-1px' }}>+</span> Record Movement
        </button>
      </div>

      {/* Metric Cards */}
      <div className="ss-g4">
        {cards.map((c) => (
          <div
            key={c.label}
            style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '14px 16px' }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '.07em',
                color: '#8A9099',
              }}
            >
              {c.label}
            </div>
            <div
              style={{
                marginTop: '13px',
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: '21px',
                fontWeight: 600,
                color: c.accent,
              }}
            >
              {c.amt}
            </div>
          </div>
        ))}
      </div>

      {/* Movements Table */}
      <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#18181C' }}>
                <th style={th}>Timestamp</th>
                <th style={th}>Type</th>
                <th style={th}>From</th>
                <th style={th}>To</th>
                <th style={th}>Reference</th>
                <th style={{ ...th, textAlign: 'right' }}>Fine Wt</th>
                <th style={th}>By</th>
              </tr>
            </thead>
            <tbody>
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#8A9099' }}>
                    {isLoading ? 'Loading movements...' : 'No material movements recorded.'}
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr
                    key={m.id}
                    style={{ background: '#111113' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#1C1C22')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#111113')}
                  >
                    <td
                      style={{
                        padding: '11px 16px',
                        borderBottom: '1px solid #1C1C20',
                        fontFamily: "'JetBrains Mono',monospace",
                        color: '#8A9099',
                      }}
                    >
                      {m.date}
                    </td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20' }}>
                      <span style={{ fontWeight: 500, color: moveType[m.type] || '#C8D0D8' }}>{m.type}</span>
                    </td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', color: '#C8D0D8' }}>
                      {m.from}
                    </td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', color: '#C8D0D8' }}>
                      {m.to}
                    </td>
                    <td
                      style={{
                        padding: '11px 16px',
                        borderBottom: '1px solid #1C1C20',
                        fontFamily: "'JetBrains Mono',monospace",
                        color: '#8A9099',
                      }}
                    >
                      {m.ref}
                    </td>
                    <td
                      style={{
                        padding: '11px 16px',
                        borderBottom: '1px solid #1C1C20',
                        fontFamily: "'JetBrains Mono',monospace",
                        textAlign: 'right',
                        color: '#F0F2F4',
                      }}
                    >
                      {fmtGn(m.wt)} g
                    </td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', color: '#8A9099' }}>
                      {m.by}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <RecordMovementModal isOpen={isRecordMovementOpen} onClose={() => setIsRecordMovementOpen(false)} />
    </div>
  );
}