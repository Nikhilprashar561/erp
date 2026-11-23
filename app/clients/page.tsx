'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useClientStore } from '@/stores/useClientStore';
import { useBillingStore } from '@/stores/useBillingStore';
import { useLedgerStore } from '@/stores/useLedgerStore';
import { useUIStore } from '@/stores/useUIStore';
import { fmtG, fmtGn, fmtINR, fmtINRn } from '@/lib/formatters';
import StatusChip from '@/components/ui/StatusChip';
import AddClientModal from '@/components/clients/AddClientModal';
import Icon from '@/components/ui/Icon';

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
  const { invoices, fetchInvoices } = useBillingStore();
  const { entries: ledgerEntries, fetchLedger } = useLedgerStore();
  const showToast = useUIStore((s) => s.showToast);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newNote, setNewNote] = useState('');
  const [clientNotes, setClientNotes] = useState<Record<string, { id: string; text: string; date: string; author: string }[]>>({
    default: [
      { id: 'n1', text: 'Prefers 925 Hallmark certification on all Payal consignments.', date: 'Today, 11:30 AM', author: 'Rakesh Kothari' },
      { id: 'n2', text: 'Credit limit approved up to ₹ 10,00,000 against post-dated cheques.', date: '18 Nov 2026', author: 'Accounts' }
    ]
  });

  useEffect(() => {
    fetchClients();
    fetchInvoices();
    fetchLedger();
  }, [fetchClients, fetchInvoices, fetchLedger]);

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.gst.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cl = clients.find((c) => c.id === selectedClientId) || filteredClients[0] || clients[0];
  const clientOrders = cl?.orders || [];

  // Filter linked data for the selected client
  const clientInvoices = invoices.filter(
    (iv) =>
      cl &&
      (iv.client.toLowerCase() === cl.name.toLowerCase() ||
        iv.client.toLowerCase().includes(cl.name.toLowerCase()) ||
        cl.name.toLowerCase().includes(iv.client.toLowerCase()))
  );

  const clientLedger = ledgerEntries.filter(
    (e) =>
      cl &&
      (e.party.toLowerCase() === cl.name.toLowerCase() ||
        e.party.toLowerCase().includes(cl.name.toLowerCase()) ||
        cl.name.toLowerCase().includes(e.party.toLowerCase()))
  );

  const clientPayments = clientLedger.filter(
    (e) => e.type === 'Payment' || e.type === 'Settlement' || (e.iIn > 0 && e.type !== 'Sale')
  );

  // Synthesize realistic chronological timeline for the selected client
  const synthesizedTimeline = cl
    ? [
        ...clientOrders.map((o) => ({
          time: o.due || 'Recent',
          type: `Order ${o.no}`,
          desc: `${o.products} · ${fmtGn(o.fine)} fine silver`,
          ref: o.status.toUpperCase(),
          tone: o.status === 'delivered' ? '#4ADE80' : '#FFC840',
        })),
        ...clientInvoices.map((iv) => ({
          time: iv.date || 'Recent',
          type: `Invoice ${iv.no}`,
          desc: `Tax invoice issued for ${fmtINR(iv.grandTotal)}`,
          ref: iv.status.toUpperCase(),
          tone: iv.status === 'paid' ? '#4ADE80' : '#60A5FA',
        })),
        ...clientPayments.map((p) => ({
          time: p.date || 'Recent',
          type: `Payment Received`,
          desc: `${fmtINR(p.iIn)} credited via ${p.type} (${p.ref})`,
          ref: 'SETTLED',
          tone: '#4ADE80',
        })),
        {
          time: '10 Nov 2026',
          type: 'Account Verified',
          desc: `GSTIN ${cl.gst} verified on GST Portal with active status`,
          ref: 'COMPLIANCE',
          tone: '#8A9099',
        },
      ]
    : [];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !cl) return;
    const currentNotes = clientNotes[cl.id] || clientNotes['default'] || [];
    setClientNotes({
      ...clientNotes,
      [cl.id]: [
        { id: `note-${Date.now()}`, text: newNote.trim(), date: 'Just now', author: 'Rakesh Kothari' },
        ...currentNotes,
      ],
    });
    setNewNote('');
    showToast('Client note recorded');
  };

  const activeNotes = (cl && clientNotes[cl.id]) || clientNotes['default'] || [];

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
          <div style={{ fontSize: '22px', fontWeight: 600, color: '#F0F2F4', letterSpacing: '-.01em' }}>Clients & Vendors</div>
          <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '3px' }}>
            Live database registry · {clients.length} accounts · Real-time ledger & invoices
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search client, city, GST..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: '#111113',
                border: '1px solid #242428',
                borderRadius: '6px',
                padding: '6px 12px 6px 30px',
                fontSize: '12px',
                color: '#E2E8ED',
                outline: 'none',
                width: '210px',
              }}
            />
            <span style={{ position: 'absolute', left: '9px', top: '7px' }}>
              <Icon name="search" color="#8A9099" size={14} />
            </span>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '32px', padding: '0 14px', background: '#C8D0D8', color: '#0A0A0B', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', border: 'none' }}
          >
            + Add Client
          </button>
        </div>
      </div>

      {/* Client switcher */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '16px' }}>
        {filteredClients.map((c) => {
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
              <span>{c.name}</span>
              {c.inrOut > 0 && (
                <span style={{ fontSize: '9px', fontFamily: "'JetBrains Mono',monospace", color: '#F87171', background: 'rgba(248,113,113,0.1)', padding: '1px 4px', borderRadius: '3px' }}>
                  ₹{(c.inrOut / 1000).toFixed(0)}k
                </span>
              )}
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
                <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'linear-gradient(135deg,#2a2a30,#18181C)', border: '1px solid #33333a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: '#E2E8ED', flexShrink: 0 }}>
                  {cl.init}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 600, color: '#F0F2F4' }}>{cl.name}</div>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', background: '#18181C', border: '1px solid #242428', padding: '1px 6px', borderRadius: '4px', color: '#8A9099' }}>
                      {cl.clientCode || 'CLI-001'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '2px' }}>{cl.city} · {cl.phone || '+91 98200 12345'}</div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: '#5a5a62', marginTop: '2px' }}>
                    GSTIN: <span style={{ color: '#8A9099' }}>{cl.gst}</span>
                  </div>
                </div>
              </div>
              <div className="ss-g4-border">
                {[
                  { l: 'Silver Outstanding', v: fmtG(cl.silverOut), c: cl.silverOut > 0 ? '#FFC840' : '#C8D0D8' },
                  { l: 'INR Outstanding', v: fmtINR(cl.inrOut), c: cl.inrOut > 0 ? '#F87171' : '#C8D0D8' },
                  { l: 'Silver Credit Limit', v: fmtG(cl.credS), c: '#C8D0D8' },
                  { l: 'INR Credit Limit', v: fmtINR(cl.credI), c: '#C8D0D8' },
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
                    gap: '6px',
                    height: '42px',
                    paddingRight: '22px',
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
                  {t.id === 'orders' && clientOrders.length > 0 && (
                    <span style={{ fontSize: '10px', background: '#18181C', padding: '1px 5px', borderRadius: '10px', color: '#8A9099' }}>{clientOrders.length}</span>
                  )}
                  {t.id === 'invoices' && clientInvoices.length > 0 && (
                    <span style={{ fontSize: '10px', background: '#18181C', padding: '1px 5px', borderRadius: '10px', color: '#8A9099' }}>{clientInvoices.length}</span>
                  )}
                  {t.id === 'ledger' && clientLedger.length > 0 && (
                    <span style={{ fontSize: '10px', background: '#18181C', padding: '1px 5px', borderRadius: '10px', color: '#8A9099' }}>{clientLedger.length}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 1. TIMELINE TAB */}
          {clientTab === 'timeline' && (
            <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '16px 20px' }}>
              {synthesizedTimeline.length > 0 ? (
                synthesizedTimeline.map((ev, i) => (
                  <div key={i} style={{ display: 'flex', gap: '14px', padding: '12px 0', borderTop: i > 0 ? '1px solid #1C1C20' : undefined }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0, width: '110px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ev.tone, flexShrink: 0 }} />
                      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', color: '#5a5a62', textAlign: 'center' }}>{ev.time}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#E2E8ED' }}>{ev.type}</span>
                        {ev.ref && (
                          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: ev.tone }}>
                            {ev.ref}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '3px' }}>{ev.desc}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '32px', textAlign: 'center', color: '#5a5a62' }}>No timeline events recorded yet.</div>
              )}
            </div>
          )}

          {/* 2. ORDERS TAB */}
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
                      <th style={{ ...th, textAlign: 'right' }}>Out Silver</th>
                      <th style={{ ...th, textAlign: 'right' }}>Out INR</th>
                      <th style={{ ...th, textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientOrders.length > 0 ? (
                      clientOrders.map((o, i) => (
                        <tr key={o.no} style={{ background: i % 2 === 0 ? '#111113' : '#0E0E10' }}>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", color: '#E2E8ED' }}>
                            <Link href={`/orders/${o.no}`} style={{ color: '#E2E8ED', textDecoration: 'none' }}>
                              {o.no}
                            </Link>
                          </td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', color: '#8A9099' }}>{o.products}</td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#C8D0D8' }}>{fmtGn(o.gross)}</td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#C8D0D8' }}>{fmtGn(o.fine)}</td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20' }}>
                            <StatusChip status={o.status as any} />
                          </td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", color: '#8A9099' }}>{o.due}</td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#C8D0D8' }}>{o.outS ? fmtGn(o.outS) : '—'}</td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#C8D0D8' }}>{o.outI ? fmtINRn(o.outI) : '—'}</td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', textAlign: 'center' }}>
                            <Link href={`/orders/${o.no}`} style={{ fontSize: '11px', color: '#60A5FA', textDecoration: 'none' }}>
                              View →
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#5a5a62' }}>
                          No orders placed by this client yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. INVOICES TAB */}
          {clientTab === 'invoices' && (
            <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr>
                      <th style={th}>Invoice No.</th>
                      <th style={th}>Date</th>
                      <th style={th}>Order Ref</th>
                      <th style={{ ...th, textAlign: 'right' }}>Total (INR)</th>
                      <th style={{ ...th, textAlign: 'right' }}>Paid (INR)</th>
                      <th style={{ ...th, textAlign: 'right' }}>Due (INR)</th>
                      <th style={th}>Status</th>
                      <th style={{ ...th, textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientInvoices.length > 0 ? (
                      clientInvoices.map((iv, i) => (
                        <tr key={iv.id} style={{ background: i % 2 === 0 ? '#111113' : '#0E0E10' }}>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", color: '#E2E8ED' }}>
                            {iv.no}
                          </td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', color: '#8A9099' }}>{iv.date}</td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", color: '#8A9099' }}>{iv.order || '—'}</td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#F0F2F4' }}>
                            {fmtINR(iv.grandTotal)}
                          </td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#4ADE80' }}>
                            {fmtINR(iv.paid || 0)}
                          </td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: iv.outstanding > 0 ? '#F87171' : '#8A9099' }}>
                            {fmtINR(iv.outstanding || 0)}
                          </td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20' }}>
                            <span style={{
                              padding: '2px 7px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 600,
                              background: iv.status === 'paid' ? 'rgba(74,222,128,0.1)' : 'rgba(255,200,64,0.1)',
                              color: iv.status === 'paid' ? '#4ADE80' : '#FFC840'
                            }}>
                              {iv.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', textAlign: 'center' }}>
                            <Link href="/billing" style={{ fontSize: '11px', color: '#60A5FA', textDecoration: 'none' }}>
                              Open Bill →
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#5a5a62' }}>
                          No invoices generated for this client yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. SILVER LEDGER TAB */}
          {clientTab === 'ledger' && (
            <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr>
                      <th style={th}>Date</th>
                      <th style={th}>Type</th>
                      <th style={th}>Ref No.</th>
                      <th style={{ ...th, textAlign: 'right' }}>Silver In</th>
                      <th style={{ ...th, textAlign: 'right' }}>Silver Out</th>
                      <th style={{ ...th, textAlign: 'right' }}>Silver Bal</th>
                      <th style={{ ...th, textAlign: 'right' }}>INR In</th>
                      <th style={{ ...th, textAlign: 'right' }}>INR Out</th>
                      <th style={{ ...th, textAlign: 'right' }}>INR Bal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientLedger.length > 0 ? (
                      clientLedger.map((row, i) => (
                        <tr key={row.id} style={{ background: i % 2 === 0 ? '#111113' : '#0E0E10' }}>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', color: '#8A9099' }}>{row.date}</td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', color: '#E2E8ED' }}>{row.type}</td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", color: '#8A9099' }}>{row.ref}</td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: row.sIn ? '#4ADE80' : '#5a5a62' }}>
                            {row.sIn ? `${fmtGn(row.sIn)}g` : '—'}
                          </td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: row.sOut ? '#FFC840' : '#5a5a62' }}>
                            {row.sOut ? `${fmtGn(row.sOut)}g` : '—'}
                          </td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#F0F2F4' }}>
                            {fmtGn(row.sBal)}g
                          </td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: row.iIn ? '#4ADE80' : '#5a5a62' }}>
                            {row.iIn ? fmtINR(row.iIn) : '—'}
                          </td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: row.iOut ? '#F87171' : '#5a5a62' }}>
                            {row.iOut ? fmtINR(row.iOut) : '—'}
                          </td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#F0F2F4' }}>
                            {fmtINR(row.iBal)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#5a5a62' }}>
                          No dual ledger transactions recorded for this client yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. PAYMENTS TAB */}
          {clientTab === 'payments' && (
            <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr>
                      <th style={th}>Date</th>
                      <th style={th}>Payment Mode / Ref</th>
                      <th style={th}>Narration</th>
                      <th style={{ ...th, textAlign: 'right' }}>Amount Paid</th>
                      <th style={{ ...th, textAlign: 'right' }}>INR Balance Post-Pay</th>
                      <th style={th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientPayments.length > 0 ? (
                      clientPayments.map((p, i) => (
                        <tr key={p.id} style={{ background: i % 2 === 0 ? '#111113' : '#0E0E10' }}>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', color: '#8A9099' }}>{p.date}</td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", color: '#E2E8ED' }}>{p.ref}</td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', color: '#8A9099' }}>{p.note || 'Settlement against bills'}</td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#4ADE80', fontWeight: 600 }}>
                            {fmtINR(p.iIn)}
                          </td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#C8D0D8' }}>
                            {fmtINR(p.iBal)}
                          </td>
                          <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20' }}>
                            <span style={{ fontSize: '10px', background: 'rgba(74,222,128,0.1)', color: '#4ADE80', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                              CLEARED
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#5a5a62' }}>
                          No payments recorded for this client.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. DOCUMENTS TAB */}
          {clientTab === 'documents' && (
            <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '18px 20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                {[
                  { title: 'GST Registration Certificate (REG-06)', type: 'PDF', size: '1.2 MB', date: 'Uploaded 12 Jan 2026', verified: true },
                  { title: 'PAN Card & Aadhaar KYC Copy', type: 'PDF', size: '850 KB', date: 'Uploaded 12 Jan 2026', verified: true },
                  { title: 'BIS Silver Hallmarking Agreement', type: 'PDF', size: '2.4 MB', date: 'Uploaded 02 Feb 2026', verified: true },
                  { title: 'Credit Limit & Trade Terms Mandate', type: 'PDF', size: '420 KB', date: 'Uploaded 18 Nov 2026', verified: true },
                ].map((doc, idx) => (
                  <div key={idx} style={{ background: '#141418', border: '1px solid #242428', borderRadius: '7px', padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '10px', fontFamily: "'JetBrains Mono',monospace", background: '#1F1F24', color: '#C8D0D8', padding: '1px 6px', borderRadius: '4px' }}>
                          {doc.type}
                        </span>
                        {doc.verified && (
                          <span style={{ fontSize: '10px', color: '#4ADE80', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#E2E8ED', lineHeight: 1.4 }}>{doc.title}</div>
                      <div style={{ fontSize: '11px', color: '#5a5a62', marginTop: '6px' }}>{doc.size} · {doc.date}</div>
                    </div>
                    <button
                      onClick={() => showToast(`Opening document: ${doc.title}`)}
                      style={{
                        marginTop: '14px',
                        background: '#18181C',
                        border: '1px solid #2E2E36',
                        borderRadius: '5px',
                        color: '#60A5FA',
                        padding: '6px 10px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      View Document →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. NOTES TAB */}
          {clientTab === 'notes' && (
            <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '18px 20px' }}>
              <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Record customer relationship note, billing instructions, or credit memo..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  style={{
                    flex: 1,
                    background: '#141418',
                    border: '1px solid #242428',
                    borderRadius: '6px',
                    padding: '8px 14px',
                    color: '#F0F2F4',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: '#C8D0D8',
                    color: '#0A0A0B',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0 16px',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Post Note
                </button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activeNotes.map((n) => (
                  <div key={n.id} style={{ background: '#141418', border: '1px solid #1C1C20', borderRadius: '7px', padding: '12px 16px' }}>
                    <div style={{ fontSize: '13px', color: '#E2E8ED', lineHeight: 1.5 }}>{n.text}</div>
                    <div style={{ fontSize: '11px', color: '#5a5a62', marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Posted by {n.author}</span>
                      <span>{n.date}</span>
                    </div>
                  </div>
                ))}
              </div>
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
