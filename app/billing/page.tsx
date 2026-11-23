'use client';
import React, { useState, useEffect } from 'react';
import { useBillingStore, type InvoiceModel } from '@/stores/useBillingStore';
import { useUIStore } from '@/stores/useUIStore';
import { fmtGn, fmtINRn } from '@/lib/formatters';
import NewInvoiceModal from '@/components/billing/NewInvoiceModal';

export default function BillingPage() {
  const {
    invoices,
    selectedInvoice,
    invoiceOpen,
    isLoading,
    fetchInvoices,
    setSelectedInvoice,
    setInvoiceOpen,
  } = useBillingStore();
  const showToast = useUIStore((s) => s.showToast);
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const totalBilled = invoices.reduce((a, iv) => a + iv.grandTotal, 0);
  const totalCollected = invoices.reduce((a, iv) => a + iv.paid, 0);
  const totalOutstanding = invoices.reduce((a, iv) => a + iv.outstanding, 0);

  const cards = [
    {
      label: 'Billed This Month',
      val: totalBilled >= 100000 ? `₹ ${(totalBilled / 100000).toFixed(2)} L` : fmtINRn(totalBilled),
      color: '#F0F2F4',
    },
    {
      label: 'Collected',
      val: totalCollected >= 100000 ? `₹ ${(totalCollected / 100000).toFixed(2)} L` : fmtINRn(totalCollected),
      color: '#4ADE80',
    },
    {
      label: 'Outstanding',
      val: totalOutstanding >= 100000 ? `₹ ${(totalOutstanding / 100000).toFixed(2)} L` : fmtINRn(totalOutstanding),
      color: '#FFC840',
    },
    {
      label: 'Invoices Raised',
      val: invoices.length.toString(),
      color: '#C8D0D8',
    },
  ];

  const chipC: Record<string, { bg: string; fg: string; label: string }> = {
    outstanding: { bg: 'rgba(138,98,0,.22)', fg: '#FFC840', label: 'Outstanding' },
    partial: { bg: 'rgba(37,99,235,.22)', fg: '#60A5FA', label: 'Partial' },
    paid: { bg: 'rgba(45,125,82,.18)', fg: '#4ADE80', label: 'Paid' },
    completed: { bg: 'rgba(45,125,82,.18)', fg: '#4ADE80', label: 'Paid' },
    overdue: { bg: 'rgba(138,32,32,.24)', fg: '#F87171', label: 'Overdue' },
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
            Billing
          </div>
          <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '3px' }}>
            Invoices with rate locked at order time · GST-ready
          </div>
        </div>
        <button
          onClick={() => setIsNewInvoiceOpen(true)}
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
          }}
        >
          <span style={{ fontSize: '15px', marginTop: '-1px' }}>+</span> New Invoice
        </button>
      </div>

      {/* Cards */}
      <div className="ss-g4">
        {cards.map((c) => (
          <div
            key={c.label}
            style={{
              background: '#111113',
              border: '1px solid #242428',
              borderRadius: '8px',
              padding: '14px 16px',
            }}
          >
            <div style={{ fontSize: '11px', color: '#8A9099' }}>{c.label}</div>
            <div
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: '22px',
                color: c.color,
                marginTop: '10px',
              }}
            >
              {c.val}
            </div>
          </div>
        ))}
      </div>

      {/* Invoice list */}
      <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#18181C' }}>
                <th style={th}>Invoice</th>
                <th style={th}>Client</th>
                <th style={th}>Order</th>
                <th style={th}>Date</th>
                <th style={{ ...th, textAlign: 'right' }}>Amount</th>
                <th style={th}>Status</th>
                <th style={{ ...th, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#8A9099' }}>
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#8A9099' }}>
                    No invoices raised yet. Click &quot;+ New Invoice&quot; to generate an invoice from an order.
                  </td>
                </tr>
              ) : (
                invoices.map((iv, i) => {
                  const chip = chipC[iv.status.toLowerCase()] || chipC.outstanding;
                  const rowBg = i % 2 === 0 ? '#111113' : '#0E0E10';
                  return (
                    <tr key={iv.id || iv.no} style={{ background: rowBg }}>
                      <td
                        style={{
                          padding: '11px 16px',
                          borderBottom: '1px solid #1C1C20',
                          fontFamily: "'JetBrains Mono',monospace",
                          color: '#E2E8ED',
                        }}
                      >
                        {iv.no}
                      </td>
                      <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', color: '#E2E8ED' }}>
                        {iv.client}
                      </td>
                      <td
                        style={{
                          padding: '11px 16px',
                          borderBottom: '1px solid #1C1C20',
                          fontFamily: "'JetBrains Mono',monospace",
                          color: '#8A9099',
                        }}
                      >
                        {iv.order}
                      </td>
                      <td
                        style={{
                          padding: '11px 16px',
                          borderBottom: '1px solid #1C1C20',
                          fontFamily: "'JetBrains Mono',monospace",
                          color: '#8A9099',
                        }}
                      >
                        {iv.date}
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
                        {fmtINRn(iv.grandTotal)}
                      </td>
                      <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            height: '19px',
                            padding: '0 7px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '.06em',
                            background: chip.bg,
                            color: chip.fg,
                          }}
                        >
                          {chip.label}
                        </span>
                      </td>
                      <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedInvoice(iv)}
                          style={{
                            fontSize: '11px',
                            color: '#60A5FA',
                            cursor: 'pointer',
                            background: 'transparent',
                            border: 'none',
                          }}
                        >
                          Preview →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice preview drawer */}
      {invoiceOpen && selectedInvoice && (
        <>
          <div
            onClick={() => setInvoiceOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,.5)' }}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '520px',
              background: '#111113',
              borderLeft: '1px solid #242428',
              zIndex: 90,
              animation: 'ssDrawer .2s ease',
              overflowY: 'auto',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '16px', fontWeight: 600, color: '#F0F2F4' }}>
                  {selectedInvoice.no}
                </div>
                <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '2px' }}>{selectedInvoice.date}</div>
              </div>
              <button
                onClick={() => setInvoiceOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#8A9099', cursor: 'pointer', fontSize: '20px' }}
              >
                ×
              </button>
            </div>

            <div style={{ background: '#0E0E10', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#F0F2F4' }}>{selectedInvoice.client}</div>
              <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '2px' }}>{selectedInvoice.city || 'India'}</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: '#5a5a62', marginTop: '2px' }}>
                GST {selectedInvoice.gst || 'Not Registered'}
              </div>
              <div style={{ marginTop: '10px', fontSize: '11px', color: '#8A9099' }}>
                Order: <span style={{ fontFamily: "'JetBrains Mono',monospace", color: '#C8D0D8' }}>{selectedInvoice.order}</span>
                {selectedInvoice.rateLock && (
                  <> · Rate: <span style={{ fontFamily: "'JetBrains Mono',monospace", color: '#C8D0D8' }}>{selectedInvoice.rateLock}</span></>
                )}
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '16px' }}>
              <thead>
                <tr style={{ background: '#18181C' }}>
                  <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: '#8A9099', borderBottom: '1px solid #242428' }}>
                    Item
                  </th>
                  <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: '#8A9099', borderBottom: '1px solid #242428' }}>
                    Fine (g)
                  </th>
                  <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: '#8A9099', borderBottom: '1px solid #242428' }}>
                    Making
                  </th>
                  <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: '#8A9099', borderBottom: '1px solid #242428' }}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.lines.map((l, i) => (
                  <tr key={l.id || i} style={{ background: i % 2 === 0 ? '#111113' : '#0E0E10' }}>
                    <td style={{ padding: '9px 10px', borderBottom: '1px solid #1C1C20', color: '#C8D0D8', fontSize: '12px' }}>
                      {l.desc}
                    </td>
                    <td style={{ padding: '9px 10px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#C8D0D8' }}>
                      {fmtGn(l.fine)}
                    </td>
                    <td style={{ padding: '9px 10px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#8A9099' }}>
                      {fmtINRn(l.making)}
                    </td>
                    <td style={{ padding: '9px 10px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#F0F2F4', fontWeight: 500 }}>
                      {fmtINRn(l.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: '#0E0E10', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#8A9099' }}>
                <span>Subtotal</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>{fmtINRn(selectedInvoice.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#8A9099' }}>
                <span>CGST (1.5%)</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>{fmtINRn(selectedInvoice.cgst)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#8A9099' }}>
                <span>SGST (1.5%)</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>{fmtINRn(selectedInvoice.sgst)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 600, color: '#F0F2F4', borderTop: '1px solid #242428', paddingTop: '8px', marginTop: '4px' }}>
                <span>Grand Total</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>{fmtINRn(selectedInvoice.grandTotal)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => showToast(`Invoice ${selectedInvoice.no} sent to ${selectedInvoice.client}`)}
                style={{ flex: 1, height: '36px', background: '#C8D0D8', color: '#0A0A0B', border: 'none', borderRadius: '7px', fontWeight: 600, cursor: 'pointer' }}
              >
                Send Invoice
              </button>
              <button
                onClick={() => showToast(`Invoice ${selectedInvoice.no} downloaded as PDF`)}
                style={{ flex: 1, height: '36px', background: 'transparent', color: '#C8D0D8', border: '1px solid #242428', borderRadius: '7px', fontWeight: 500, cursor: 'pointer' }}
              >
                Download PDF
              </button>
            </div>
          </div>
        </>
      )}

      {/* New Invoice Modal */}
      <NewInvoiceModal
        isOpen={isNewInvoiceOpen}
        onClose={() => setIsNewInvoiceOpen(false)}
      />
    </div>
  );
}
