'use client';
import React, { useEffect, useState } from 'react';
import { useKarigarStore } from '@/stores/useKarigarStore';
import { fmtG, fmtGn, fmtINR } from '@/lib/formatters';
import StatusChip from '@/components/ui/StatusChip';
import AssignWorkModal from '@/components/karigar/AssignWorkModal';

const rc: Record<string, string> = { green: '#4ADE80', amber: '#FFC840', red: '#F87171' };

export default function KarigarPage() {
  const { karigars, selectedKarigarId, setSelectedKarigarId, fetchKarigars, isLoading } = useKarigarStore();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  useEffect(() => {
    fetchKarigars();
  }, [fetchKarigars]);

  const selK = karigars.find((k) => k.id === selectedKarigarId) || karigars[0];
  const pieces = selK?.piecesList || [];

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
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 600, color: '#F0F2F4', letterSpacing: '-.01em' }}>Karigar Workshop</div>
          <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '3px' }}>
            In-house artisans · live metal in hand, wastage & payables
          </div>
        </div>
        <button
          onClick={() => setIsAssignModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', height: '32px', padding: '0 14px', background: '#C8D0D8', color: '#0A0A0B', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', border: 'none' }}
        >
          + Assign Work
        </button>
      </div>

      <div className="ss-panel-k">
        {/* Karigar list */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: '#8A9099', marginBottom: '10px' }}>
            Artisans · {karigars.length}
          </div>
          {karigars.map((k) => {
            const isSelected = selK?.id === k.id;
            return (
              <div
                key={k.id}
                onClick={() => setSelectedKarigarId(k.id)}
                style={{
                  padding: '12px 13px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: isSelected ? '#33333a' : '#1C1C20',
                  background: isSelected ? '#18181C' : '#0E0E10',
                  marginBottom: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: rc[k.risk] || '#4ADE80' }} />
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#E2E8ED' }}>{k.name}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#8A9099', marginTop: '6px' }}>{k.skill}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '11px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#5a5a62' }}>Held</div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', color: '#F0F2F4', marginTop: '2px' }}>{fmtGn(k.held)} g</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#5a5a62' }}>Pieces</div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', color: '#C8D0D8', marginTop: '2px' }}>{k.pieces}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: '#5a5a62' }}>Wastage</div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', color: '#C8D0D8', marginTop: '2px' }}>{k.wastage}%</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected karigar detail */}
        {selK ? (
          <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid #1C1C20' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: rc[selK.risk] || '#4ADE80' }} />
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#F0F2F4' }}>{selK.name}</span>
                <span style={{ fontSize: '12px', color: '#8A9099', marginLeft: '4px' }}>{selK.skill}</span>
              </div>
              <div className="ss-g4-border" style={{ marginTop: '14px' }}>
                {[
                  { l: 'Silver Held', v: fmtG(selK.held), c: '#F0F2F4' },
                  { l: 'Pieces', v: String(selK.pieces), c: '#C8D0D8' },
                  { l: 'Wastage', v: selK.wastage + '%', c: '#FFC840' },
                  { l: 'Payable', v: fmtINR(selK.payable), c: '#C8D0D8' },
                ].map((f) => (
                  <div key={f.l} style={{ background: '#0E0E10', padding: '11px 14px' }}>
                    <div style={{ fontSize: '10px', color: '#8A9099' }}>{f.l}</div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '15px', color: f.c, marginTop: '5px' }}>{f.v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#18181C' }}>
                    <th style={th}>Piece ID</th>
                    <th style={th}>Product</th>
                    <th style={{ ...th, textAlign: 'right' }}>Issued</th>
                    <th style={{ ...th, textAlign: 'right' }}>Exp. Fine</th>
                    <th style={th}>Due</th>
                    <th style={th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pieces.length > 0 ? (
                    pieces.map((p, i) => (
                      <tr key={p.pid} style={{ background: i % 2 === 0 ? '#111113' : '#0E0E10' }}>
                        <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", color: '#E2E8ED' }}>{p.pid}</td>
                        <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', color: '#C8D0D8' }}>{p.product}</td>
                        <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#C8D0D8' }}>{fmtGn(p.issued)}</td>
                        <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#C8D0D8' }}>{fmtGn(p.exp)}</td>
                        <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", color: '#8A9099' }}>{p.due}</td>
                        <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20' }}>
                          <StatusChip status={p.status as any} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#5a5a62' }}>
                        No active pieces currently assigned
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{ padding: '48px', textAlign: 'center', color: '#8A9099' }}>
            {isLoading ? 'Loading artisans from database...' : 'No artisans found.'}
          </div>
        )}
      </div>

      {/* Assign Work Modal */}
      <AssignWorkModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        defaultKarigarId={selK?.id}
      />
    </div>
  );
}
