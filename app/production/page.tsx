'use client';
import React from 'react';
import { useApp } from '@/lib/store/AppContext';
import { productionStages } from '@/lib/data';
import { fmtGn } from '@/lib/formatters';

export default function ProductionPage() {
  const { batches, productionView, setProductionView, advanceBatch } = useApp();
  const isKanban = productionView === 'kanban';

  const toggleStyle = (active: boolean) => ({
    display: 'flex', alignItems: 'center', height: '28px', padding: '0 12px', borderRadius: '5px',
    fontSize: '12px', fontWeight: 500, color: active ? '#0A0A0B' : '#8A9099',
    background: active ? '#C8D0D8' : 'transparent', cursor: 'pointer', border: 'none',
  });

  const th = { textAlign: 'left' as const, padding: '10px 16px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '.06em', color: '#8A9099', borderBottom: '1px solid #242428' };

  return (
    <div className="ss-page">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 600, color: '#F0F2F4', letterSpacing: '-.01em' }}>Production Floor</div>
          <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '3px' }}>Live batch flow across stages · bottlenecks auto-flagged</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: '#111113', border: '1px solid #242428', borderRadius: '7px', padding: '3px' }}>
          <button onClick={() => setProductionView('kanban')} style={toggleStyle(isKanban)}>Stage View</button>
          <button onClick={() => setProductionView('table')} style={toggleStyle(!isKanban)}>Table View</button>
        </div>
      </div>

      {isKanban ? (
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
          {productionStages.map(s => {
            const stageBatches = batches.filter(b => b.stage === s.id);
            return (
              <div key={s.id} style={{ flexShrink: 0, width: '208px', background: '#0E0E10', border: '1px solid #1C1C20', borderRadius: '10px', padding: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px 10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: '#8A9099' }}>{s.name}</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: '#5a5a62' }}>{stageBatches.length}</span>
                </div>
                {stageBatches.map(b => (
                  <div key={b.bid} style={{ background: '#141418', border: '1px solid #242428', borderRadius: '8px', padding: '11px 12px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: '#8A9099' }}>{b.bid}</span>
                      {b.delay && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F87171', animation: 'ssPulse 2s infinite' }} />}
                    </div>
                    <div style={{ fontSize: '13px', color: '#E2E8ED', marginTop: '6px' }}>{b.product}</div>
                    <div style={{ fontSize: '11px', color: '#8A9099', marginTop: '2px' }}>{b.client}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '9px', borderTop: '1px solid #1C1C20' }}>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: '#C8D0D8' }}>{fmtGn(b.wt)} g</span>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', color: '#5a5a62' }}>{b.inStage}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#8A9099' }}>{b.karigar}</span>
                      <button onClick={() => advanceBatch(b.bid)} style={{ fontSize: '10px', color: '#60A5FA', cursor: 'pointer', background: 'transparent', border: 'none' }}>Advance →</button>
                    </div>
                  </div>
                ))}
                {stageBatches.length === 0 && (
                  <div style={{ padding: '12px', color: '#3a3a40', fontSize: '11px', textAlign: 'center' }}>Empty</div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '920px' }}>
              <thead><tr style={{ background: '#18181C' }}>
                <th style={th}>Batch ID</th>
                <th style={th}>Order</th>
                <th style={th}>Client</th>
                <th style={th}>Product</th>
                <th style={{ ...th, textAlign: 'right' }}>Weight</th>
                <th style={th}>Stage</th>
                <th style={th}>Assigned</th>
                <th style={th}>In Stage</th>
                <th style={th}>Health</th>
                <th style={{ ...th, textAlign: 'right' }}>Action</th>
              </tr></thead>
              <tbody>
                {batches.map((b, i) => {
                  const stageName = productionStages.find(s => s.id === b.stage)?.name || b.stage;
                  return (
                    <tr key={b.bid} style={{ background: i % 2 === 0 ? '#111113' : '#0E0E10' }}>
                      <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", color: '#E2E8ED' }}>{b.bid}</td>
                      <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", color: '#8A9099' }}>{b.ref}</td>
                      <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', color: '#C8D0D8' }}>{b.client}</td>
                      <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', color: '#C8D0D8' }}>{b.product}</td>
                      <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#C8D0D8' }}>{fmtGn(b.wt)}</td>
                      <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', color: '#E2E8ED' }}>{stageName}</td>
                      <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', color: '#8A9099' }}>{b.karigar}</td>
                      <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", color: '#8A9099' }}>{b.inStage}</td>
                      <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', color: b.delay ? '#F87171' : '#4ADE80' }}>{b.delay ? 'Delayed' : 'On track'}</td>
                      <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', textAlign: 'right' }}>
                        <button onClick={() => advanceBatch(b.bid)} style={{ fontSize: '11px', color: '#60A5FA', cursor: 'pointer', background: 'transparent', border: 'none' }}>Advance →</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
