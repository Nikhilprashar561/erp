'use client';
import React, { useEffect, useState } from 'react';
import { useClientStore } from '@/stores/useClientStore';
import { useUIStore } from '@/stores/useUIStore';
import { timeline } from '@/lib/data';
import { fmtG, fmtGn, fmtINR, fmtINRn } from '@/lib/formatters';
import StatusChip from '@/components/ui/StatusChip';
import AddClientModal from '@/components/clients/AddClientModal';

const tabs = [
  { id: 'timeline', label: 'Timeline' },
  { id: 'orders', label: 'Orders' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'ledger', label: 'Silver Ledger' },
  { id: 'payments', label: 'Payments' },
  { id: 'documents', label: 'Documents' },
  { id: 'notes', label: 'Notes' },
];

export default function ClientsPage() {
  const { clients, selectedClientId, setSelectedClientId, clientTab, setClientTab, fetchClients, isLoading } = useClientStore();
  const showToast = useUIStore((s) => s.showToast);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const cl = clients.find((c) => c.id === selectedClientId) || clients[0];
  const clientOrders = cl?.orders || [];

  const th = {
    textAlign: 'left' as const,
    padding: '9px 14px',
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '.07em',
    color: '#8A9099',
    borderBottom: '1px solid #242428',
    background: '#18181C',
  };

  return (
    <div className="ss-page">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 600, color: '#F0F2F4', letterSpacing: '-.01em' }}>Clients / Vendors</div>
          <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '3px' }}>
            Live database registry · {clients.length} accounts loaded
          </div>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '32px', padding: '0 14px', background: '#C8D0D8', color: '#0A0A0B', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', border: 'none' }}
        >
          + Add Client
        </button>
      </div>

      {/* Client switcher */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '16px' }}>
        {clients.map((c) => {
          const isSelected = cl?.id === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedClientId(c.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                height: '34px',
                padding: '0 12px 0 8px',
                borderRadius: '7px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                border: '1px solid',
                borderColor: isSelected ? '#33333a' : '#1C1C20',
                background: isSelected ? '#18181C' : 'transparent',
                color: isSelected ? '#E2E8ED' : '#8A9099',
              }}
            >
              <span style={{ width: '20px', height: '20px', borderRadius: '5px', background: 'linear-gradient(135deg,#2a2a30,#18181C)', border: '1px solid #33333a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 600, color: '#E2E8ED', flexShrink: 0 }}>
                {c.init}
              </span>
              {c.name}
            </button>
          );
        })}
      </div>

      {cl ? (
        <>
          {/* Client header card */}
          <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '10px', overflow: 'hidden', marginBottom: '14px' }}>
            <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'linear-gradient(135deg,#2a2a30,#18181C)', border: '1px solid #33333a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: '#E2E8ED', flexShrink: 0 }}>
                  {cl.init}
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#F0F2F4' }}>{cl.name}</div>
                  <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '2px' }}>{cl.city}</div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: '#5a5a62', marginTop: '2px' }}>GST {cl.gst}</div>
                </div>
              </div>
              <div className="ss-g4-border">
                {[
                  { l: 'Silver Outstanding', v: fmtG(cl.silverOut), c: cl.silverOut > 0 ? '#FFC840' : '#C8D0D8' },
                  { l: 'INR Outstanding', v: fmtINR(cl.inrOut), c: cl.inrOut > 0 ? '#F87171' : '#C8D0D8' },
                  { l: 'Silver Credit', v: fmtG(cl.credS), c: '#C8D0D8' },
                  { l: 'INR Credit', v: fmtINR(cl.credI), c: '#C8D0D8' },
                ].map((f) => (
                  <div key={f.l} style={{ background: '#0E0E10', padding: '12px 16px' }}>
                    <div style={{ fontSize: '10px', color: '#8A9099' }}>{f.l}</div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '15px', color: f.c, marginTop: '5px' }}>{f.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderTop: '1px solid #1C1C20', padding: '0 20px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setClientTab(t.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    height: '42px',
                    paddingRight: '24px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: clientTab === t.id ? 600 : 400,
                    color: clientTab === t.id ? '#F0F2F4' : '#8A9099',
                    borderTop: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    background: 'transparent',
                    borderBottom: `2px solid ${clientTab === t.id ? '#C8D0D8' : 'transparent'}`,
                    flexShrink: 0,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {clientTab === 'timeline' && (
            <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '16px 18px' }}>
              {timeline.map((ev, i) => (
                <div key={i} style={{ display: 'flex', gap: '14px', padding: '12px 0', borderTop: i > 0 ? '1px solid #1C1C20' : undefined }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0, width: '120px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ev.tone, flexShrink: 0 }} />
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', color: '#5a5a62', textAlign: 'center' }}>{ev.time}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#E2E8ED' }}>{ev.type}</div>
                    <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '2px' }}>{ev.desc}</div>
                    {ev.ref && <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: ev.tone, marginTop: '4px' }}>{ev.ref}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {clientTab === 'orders' && (
            <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr>
                      <th style={th}>Order No.</th>
                      <th style={th}>Products</th>
                      <th style={{ ...th, textAlign: 'right' }}>Gross</th>
                      <th style={{ ...th, textAlign: 'right' }}>Fine</th>
                      <th style={th}>Status</th>
                      <th style={th}>Due</th>
                      <th style={{ ...th, textAlign: 'right' }}>Out S</th>
                      <th style={{ ...th, textAlign: 'right' }}>Out INR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientOrders.length > 0 ? (
                      clientOrders.map((o, i) => (
                        <tr key={o.no} style={{ background: i % 2 === 0 ? '#111113' : '#0E0E10' }}>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", color: '#E2E8ED' }}>{o.no}</td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', color: '#8A9099' }}>{o.products}</td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#C8D0D8' }}>{fmtGn(o.gross)}</td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#C8D0D8' }}>{fmtGn(o.fine)}</td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20' }}>
                            <StatusChip status={o.status as any} />
                          </td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", color: '#8A9099' }}>{o.due}</td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#C8D0D8' }}>{o.outS ? fmtGn(o.outS) : '—'}</td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#C8D0D8' }}>{o.outI ? fmtINRn(o.outI) : '—'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#5a5a62' }}>
                          No orders placed by this client yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!['timeline', 'orders'].includes(clientTab) && (
            <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '48px', textAlign: 'center', color: '#5a5a62', fontSize: '13px' }}>
              {tabs.find((t) => t.id === clientTab)?.label} — live integration active
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: '48px', textAlign: 'center', color: '#8A9099' }}>
          {isLoading ? 'Loading live clients from database...' : 'No clients found.'}
        </div>
      )}

      {/* Add Client Modal */}
      <AddClientModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
