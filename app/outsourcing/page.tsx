'use client';
import React from 'react';
import { useApp } from '@/lib/store/AppContext';
import { workers, jobsByWorker } from '@/lib/data';
import { fmtG, fmtGn, fmtINR, fmtINRn, statusMeta, chipStyle } from '@/lib/formatters';
import StatusChip from '@/components/ui/StatusChip';
import type { Job } from '@/lib/types';

const rc: Record<string, string> = { green: '#4ADE80', amber: '#FFC840', red: '#F87171' };

export default function OutsourcingPage() {
  const { selectedWorker, setSelectedWorker, drawerJob, setDrawerJob, showToast } = useApp();
  const selW = workers.find(w => w.id === selectedWorker) || workers[0];
  const jobs = (jobsByWorker[selW.id] || []) as Job[];
  const dj = drawerJob as Job | null;

  const th = { textAlign: 'left' as const, padding: '10px 16px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '.06em', color: '#8A9099', borderBottom: '1px solid #242428' };

  return (
    <div className="ss-page" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 600, color: '#F0F2F4', letterSpacing: '-.01em' }}>Outsourcing</div>
          <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '3px' }}>Job workers · silver out, returns & pending accountability</div>
        </div>
        <button onClick={() => showToast('New job order created')} style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '32px', padding: '0 14px', background: '#C8D0D8', color: '#0A0A0B', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', border: 'none' }}>+ New Job Order</button>
      </div>

      <div className="ss-panel-s">
        {/* Worker list */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: '#8A9099', marginBottom: '10px' }}>Job Workers · {workers.length}</div>
          {workers.map(w => (
            <div key={w.id} onClick={() => setSelectedWorker(w.id)} style={{ padding: '12px 13px', borderRadius: '8px', cursor: 'pointer', transition: 'all .08s', border: '1px solid', borderColor: selectedWorker === w.id ? '#33333a' : '#1C1C20', background: selectedWorker === w.id ? '#18181C' : '#0E0E10', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: rc[w.risk] }} />
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#E2E8ED' }}>{w.name}</span>
                </div>
                {w.overdue > 0 && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', color: '#F87171', background: 'rgba(138,32,32,.2)', borderRadius: '4px', padding: '0 5px' }}>{w.overdue} OD</span>}
              </div>
              <div style={{ fontSize: '11px', color: '#8A9099', marginTop: '4px' }}>{w.spec}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <div><div style={{ fontSize: '10px', color: '#5a5a62' }}>Held</div><div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', color: '#F0F2F4', marginTop: '2px' }}>{fmtGn(w.held)} g</div></div>
                <div><div style={{ fontSize: '10px', color: '#5a5a62' }}>Active</div><div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', color: '#C8D0D8', marginTop: '2px' }}>{w.active} jobs</div></div>
              </div>
            </div>
          ))}
        </div>

        {/* Jobs table */}
        <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '15px 18px', borderBottom: '1px solid #1C1C20', display: 'flex', alignItems: 'center', gap: '9px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: rc[selW.risk] }} />
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#F0F2F4' }}>{selW.name}</span>
            <span style={{ fontSize: '12px', color: '#8A9099', marginLeft: '4px' }}>{selW.spec}</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px' }}>
              <div><div style={{ fontSize: '10px', color: '#8A9099' }}>Silver Held</div><div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '14px', color: '#F0F2F4', marginTop: '3px' }}>{fmtG(selW.held)}</div></div>
              <div><div style={{ fontSize: '10px', color: '#8A9099' }}>Active Jobs</div><div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '14px', color: '#C8D0D8', marginTop: '3px' }}>{selW.active}</div></div>
              <div><div style={{ fontSize: '10px', color: '#8A9099' }}>Overdue</div><div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '14px', color: selW.overdue > 0 ? '#F87171' : '#C8D0D8', marginTop: '3px' }}>{selW.overdue}</div></div>
            </div>
          </div>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead><tr style={{ background: '#18181C' }}>
                <th style={th}>Job ID</th>
                <th style={th}>Order Ref</th>
                <th style={th}>Job Type</th>
                <th style={{ ...th, textAlign: 'right' }}>Sent</th>
                <th style={{ ...th, textAlign: 'right' }}>Returned</th>
                <th style={{ ...th, textAlign: 'right' }}>Pending</th>
                <th style={th}>Due</th>
                <th style={th}>Status</th>
                <th style={{ ...th, textAlign: 'right' }}>Labour</th>
              </tr></thead>
              <tbody>
                {jobs.map((j, i) => (
                  <tr key={j.jid} style={{ background: i % 2 === 0 ? '#111113' : '#0E0E10', cursor: 'pointer' }}
                    onClick={() => setDrawerJob(j)}
                    onMouseEnter={e => (e.currentTarget.style.background = '#1C1C22')}
                    onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#111113' : '#0E0E10')}>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", color: '#E2E8ED' }}>{j.jid}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", color: '#8A9099' }}>{j.ref}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', color: '#C8D0D8' }}>{j.jtype}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#C8D0D8' }}>{fmtGn(j.sent)}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#4ADE80' }}>{j.ret ? fmtGn(j.ret) : '—'}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#FFC840' }}>{fmtGn(Math.max(0, j.sent - j.ret))}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", color: '#8A9099' }}>{j.due}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20' }}><StatusChip status={j.status} /></td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#C8D0D8' }}>{fmtINRn(j.labour)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Job Drawer */}
      {dj && (
        <>
          <div onClick={() => setDrawerJob(null)} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,.4)' }} />
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '360px', background: '#111113', borderLeft: '1px solid #242428', zIndex: 90, animation: 'ssDrawer .2s ease', padding: '20px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '16px', fontWeight: 600, color: '#F0F2F4' }}>{dj.jid}</div>
              <button onClick={() => setDrawerJob(null)} style={{ background: 'transparent', border: 'none', color: '#8A9099', cursor: 'pointer', fontSize: '18px' }}>×</button>
            </div>
            <StatusChip status={dj.status} />
            <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#1C1C20', borderRadius: '8px', overflow: 'hidden' }}>
              {[
                { l: 'Order Ref', v: dj.ref },
                { l: 'Job Type', v: dj.jtype },
                { l: 'Silver Sent', v: fmtG(dj.sent) },
                { l: 'Returned', v: dj.ret ? fmtG(dj.ret) : '—' },
                { l: 'Pending', v: fmtG(Math.max(0, dj.sent - dj.ret)) },
                { l: 'Due', v: dj.due },
                { l: 'Labour', v: fmtINR(dj.labour) },
              ].map(f => (
                <div key={f.l} style={{ background: '#0E0E10', padding: '11px 14px' }}>
                  <div style={{ fontSize: '10px', color: '#8A9099' }}>{f.l}</div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '13px', color: '#F0F2F4', marginTop: '4px' }}>{f.v}</div>
                </div>
              ))}
            </div>
            <button onClick={() => { showToast('Silver return recorded'); setDrawerJob(null); }} style={{ marginTop: '20px', width: '100%', height: '36px', background: '#C8D0D8', color: '#0A0A0B', border: 'none', borderRadius: '7px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>Record Return</button>
          </div>
        </>
      )}
    </div>
  );
}
