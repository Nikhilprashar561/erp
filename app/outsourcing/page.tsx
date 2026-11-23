'use client';
import React, { useEffect, useState } from 'react';
import { useOutsourcingStore, type OutsourceJobModel } from '@/stores/useOutsourcingStore';
import { useUIStore } from '@/stores/useUIStore';
import { fmtG, fmtGn, fmtINR, fmtINRn } from '@/lib/formatters';
import StatusChip from '@/components/ui/StatusChip';
import NewJobModal from '@/components/outsourcing/NewJobModal';

const rc: Record<string, string> = { green: '#4ADE80', amber: '#FFC840', red: '#F87171' };

export default function OutsourcingPage() {
  const {
    workers,
    jobsByWorker,
    selectedWorkerId,
    setSelectedWorker,
    drawerJob,
    setDrawerJob,
    recordJobReturn,
    fetchWorkersAndJobs,
    isLoading,
    isSubmitting,
  } = useOutsourcingStore();
  const showToast = useUIStore((s) => s.showToast);

  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [returnWeight, setReturnWeight] = useState<number>(0);
  const [scrapWeight, setScrapWeight] = useState<number>(0);
  const [isRecordReturnOpen, setIsRecordReturnOpen] = useState(false);

  useEffect(() => {
    fetchWorkersAndJobs();
  }, [fetchWorkersAndJobs]);

  const selW = workers.find((w) => w.id === selectedWorkerId) || workers[0];
  const jobs = selW ? jobsByWorker[selW.id] || [] : [];
  const dj = drawerJob;

  useEffect(() => {
    if (dj) {
      const pending = Math.max(0, dj.sent - dj.ret);
      setReturnWeight(pending);
      setScrapWeight(0);
      setIsRecordReturnOpen(false);
    }
  }, [dj]);

  const handleConfirmReturn = async () => {
    if (!dj) return;
    if (returnWeight <= 0) {
      showToast('Return weight must be greater than 0');
      return;
    }

    const res = await recordJobReturn({
      jobId: dj.jid,
      weightReturned: returnWeight,
      scrapReturned: scrapWeight,
      isCompleted: dj.ret + returnWeight >= dj.sent,
    });

    if (res.success) {
      showToast(`Silver return of ${returnWeight.toFixed(3)} g recorded for ${dj.jid}`);
      setIsRecordReturnOpen(false);
    } else {
      showToast(res.error || 'Failed to record return');
    }
  };

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
    <div className="ss-page" style={{ position: 'relative' }}>
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
            Outsourcing
          </div>
          <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '3px' }}>
            {isLoading && workers.length === 0
              ? 'Loading job workers from database...'
              : 'Job workers · silver out, returns & pending accountability'}
          </div>
        </div>
        <button
          onClick={() => setIsNewJobOpen(true)}
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
          + New Job Order
        </button>
      </div>

      <div className="ss-panel-s">
        {/* Worker list */}
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '.08em',
              color: '#8A9099',
              marginBottom: '10px',
            }}
          >
            Job Workers · {workers.length}
          </div>
          {workers.map((w) => {
            const isSelected = selW && selW.id === w.id;
            return (
              <div
                key={w.id}
                onClick={() => setSelectedWorker(w.id)}
                style={{
                  padding: '12px 13px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all .08s',
                  border: '1px solid',
                  borderColor: isSelected ? '#33333a' : '#1C1C20',
                  background: isSelected ? '#18181C' : '#0E0E10',
                  marginBottom: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: rc[w.risk] || '#4ADE80',
                      }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#E2E8ED' }}>{w.name}</span>
                  </div>
                  {w.overdue > 0 && (
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: '10px',
                        color: '#F87171',
                        background: 'rgba(138,32,32,.2)',
                        borderRadius: '4px',
                        padding: '0 5px',
                      }}
                    >
                      {w.overdue} OD
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: '#8A9099', marginTop: '4px' }}>{w.spec}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#5a5a62' }}>Held</div>
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: '12px',
                        color: '#F0F2F4',
                        marginTop: '2px',
                      }}
                    >
                      {fmtGn(w.held)} g
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#5a5a62' }}>Active</div>
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: '12px',
                        color: '#C8D0D8',
                        marginTop: '2px',
                      }}
                    >
                      {w.active} jobs
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Jobs table */}
        {selW ? (
          <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '10px', overflow: 'hidden' }}>
            <div
              style={{
                padding: '15px 18px',
                borderBottom: '1px solid #1C1C20',
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: rc[selW.risk] || '#4ADE80',
                }}
              />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#F0F2F4' }}>{selW.name}</span>
              <span style={{ fontSize: '12px', color: '#8A9099', marginLeft: '4px' }}>{selW.spec}</span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#8A9099' }}>Silver Held</div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: '14px',
                      color: '#F0F2F4',
                      marginTop: '3px',
                    }}
                  >
                    {fmtG(selW.held)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#8A9099' }}>Active Jobs</div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: '14px',
                      color: '#C8D0D8',
                      marginTop: '3px',
                    }}
                  >
                    {selW.active}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#8A9099' }}>Overdue</div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: '14px',
                      color: selW.overdue > 0 ? '#F87171' : '#C8D0D8',
                      marginTop: '3px',
                    }}
                  >
                    {selW.overdue}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#18181C' }}>
                    <th style={th}>Job ID</th>
                    <th style={th}>Order Ref</th>
                    <th style={th}>Job Type</th>
                    <th style={{ ...th, textAlign: 'right' }}>Sent</th>
                    <th style={{ ...th, textAlign: 'right' }}>Returned</th>
                    <th style={{ ...th, textAlign: 'right' }}>Pending</th>
                    <th style={th}>Due</th>
                    <th style={th}>Status</th>
                    <th style={{ ...th, textAlign: 'right' }}>Labour</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#8A9099' }}>
                        No jobs currently assigned to {selW.name}.
                      </td>
                    </tr>
                  ) : (
                    jobs.map((j, i) => (
                      <tr
                        key={j.jid}
                        style={{ background: i % 2 === 0 ? '#111113' : '#0E0E10', cursor: 'pointer' }}
                        onClick={() => setDrawerJob(j)}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#1C1C22')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? '#111113' : '#0E0E10')}
                      >
                        <td
                          style={{
                            padding: '11px 16px',
                            borderBottom: '1px solid #1C1C20',
                            fontFamily: "'JetBrains Mono',monospace",
                            color: '#E2E8ED',
                          }}
                        >
                          {j.jid}
                        </td>
                        <td
                          style={{
                            padding: '11px 16px',
                            borderBottom: '1px solid #1C1C20',
                            fontFamily: "'JetBrains Mono',monospace",
                            color: '#8A9099',
                          }}
                        >
                          {j.ref}
                        </td>
                        <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', color: '#C8D0D8' }}>
                          {j.jtype}
                        </td>
                        <td
                          style={{
                            padding: '11px 16px',
                            borderBottom: '1px solid #1C1C20',
                            fontFamily: "'JetBrains Mono',monospace",
                            textAlign: 'right',
                            color: '#C8D0D8',
                          }}
                        >
                          {fmtGn(j.sent)}
                        </td>
                        <td
                          style={{
                            padding: '11px 16px',
                            borderBottom: '1px solid #1C1C20',
                            fontFamily: "'JetBrains Mono',monospace",
                            textAlign: 'right',
                            color: '#4ADE80',
                          }}
                        >
                          {j.ret ? fmtGn(j.ret) : '—'}
                        </td>
                        <td
                          style={{
                            padding: '11px 16px',
                            borderBottom: '1px solid #1C1C20',
                            fontFamily: "'JetBrains Mono',monospace",
                            textAlign: 'right',
                            color: '#FFC840',
                          }}
                        >
                          {fmtGn(Math.max(0, j.sent - j.ret))}
                        </td>
                        <td
                          style={{
                            padding: '11px 16px',
                            borderBottom: '1px solid #1C1C20',
                            fontFamily: "'JetBrains Mono',monospace",
                            color: '#8A9099',
                          }}
                        >
                          {j.due}
                        </td>
                        <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20' }}>
                          <StatusChip status={j.status} />
                        </td>
                        <td
                          style={{
                            padding: '11px 16px',
                            borderBottom: '1px solid #1C1C20',
                            fontFamily: "'JetBrains Mono',monospace",
                            textAlign: 'right',
                            color: '#C8D0D8',
                          }}
                        >
                          {fmtINRn(j.labour)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>

      {/* Job Drawer */}
      {dj && (
        <>
          <div
            onClick={() => setDrawerJob(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,.5)' }}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '380px',
              background: '#111113',
              borderLeft: '1px solid #242428',
              zIndex: 90,
              animation: 'ssDrawer .2s ease',
              padding: '24px',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '18px', fontWeight: 600, color: '#F0F2F4' }}>
                {dj.jid}
              </div>
              <button
                onClick={() => setDrawerJob(null)}
                style={{ background: 'transparent', border: 'none', color: '#8A9099', cursor: 'pointer', fontSize: '20px' }}
              >
                ×
              </button>
            </div>
            <StatusChip status={dj.status} />

            <div
              style={{
                marginTop: '20px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1px',
                background: '#1C1C20',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              {[
                { l: 'Order Ref', v: dj.ref },
                { l: 'Job Type', v: dj.jtype },
                { l: 'Silver Sent', v: fmtG(dj.sent) },
                { l: 'Returned', v: dj.ret ? fmtG(dj.ret) : '—' },
                { l: 'Pending', v: fmtG(Math.max(0, dj.sent - dj.ret)) },
                { l: 'Due Date', v: dj.due },
                { l: 'Labour Cost', v: fmtINR(dj.labour) },
              ].map((f) => (
                <div key={f.l} style={{ background: '#0E0E10', padding: '11px 14px' }}>
                  <div style={{ fontSize: '10px', color: '#8A9099' }}>{f.l}</div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: '13px',
                      color: '#F0F2F4',
                      marginTop: '4px',
                    }}
                  >
                    {f.v}
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Return Form */}
            {isRecordReturnOpen ? (
              <div
                style={{
                  marginTop: '20px',
                  background: '#18181C',
                  border: '1px solid #242428',
                  borderRadius: '8px',
                  padding: '16px',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#F0F2F4', marginBottom: '12px' }}>
                  Record Silver Return
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '10px', color: '#8A9099', marginBottom: '4px' }}>
                    Returned Weight (grams)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={returnWeight}
                    onChange={(e) => setReturnWeight(parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      height: '32px',
                      background: '#111113',
                      border: '1px solid #33333a',
                      borderRadius: '6px',
                      padding: '0 10px',
                      color: '#F0F2F4',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '10px', color: '#8A9099', marginBottom: '4px' }}>
                    Dust / Scrap Weight (grams)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={scrapWeight}
                    onChange={(e) => setScrapWeight(parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      height: '32px',
                      background: '#111113',
                      border: '1px solid #33333a',
                      borderRadius: '6px',
                      padding: '0 10px',
                      color: '#F0F2F4',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setIsRecordReturnOpen(false)}
                    style={{
                      flex: 1,
                      height: '34px',
                      background: 'transparent',
                      border: '1px solid #242428',
                      borderRadius: '6px',
                      color: '#8A9099',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmReturn}
                    disabled={isSubmitting}
                    style={{
                      flex: 2,
                      height: '34px',
                      background: '#4ADE80',
                      color: '#0A0A0B',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    {isSubmitting ? 'Recording...' : 'Confirm Return'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsRecordReturnOpen(true)}
                style={{
                  marginTop: '20px',
                  width: '100%',
                  height: '36px',
                  background: '#C8D0D8',
                  color: '#0A0A0B',
                  border: 'none',
                  borderRadius: '7px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Record Return
              </button>
            )}
          </div>
        </>
      )}

      {/* Modal */}
      <NewJobModal
        isOpen={isNewJobOpen}
        onClose={() => setIsNewJobOpen(false)}
        defaultWorkerId={selW?.id}
      />
    </div>
  );
}