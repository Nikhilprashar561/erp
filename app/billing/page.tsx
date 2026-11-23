'use client';
import React, { useState } from 'react';
import { useApp } from '@/lib/store/AppContext';
import { fmtGn, fmtINRn } from '@/lib/formatters';

export default function BillingPage() {
  const { showToast, invoiceOpen, setInvoiceOpen } = useApp();

  const invoices = [
    { no: 'INV-1190', client: 'Mehta Jewels', order: 'ORD-2241', date: '14 Jun 25', amt: '₹ 1,35,153', status: 'outstanding', rowBg: '#111113' },
    { no: 'INV-1187', client: 'Kalyan Silver House', order: 'ORD-2238', date: '12 Jun 25', amt: '₹ 96,000', status: 'partial', rowBg: '#0E0E10' },
    { no: 'INV-1185', client: 'Rajwadi Silver Arts', order: 'ORD-2234', date: '10 Jun 25', amt: '₹ 1,80,000', status: 'completed', rowBg: '#111113' },
    { no: 'INV-1180', client: 'Shree Ganesh Orn.', order: 'ORD-2233', date: '06 Jun 25', amt: '₹ 5,12,000', status: 'overdue', rowBg: '#0E0E10' },
    { no: 'INV-1175', client: 'Vasupati Silver', order: 'ORD-2232', date: '02 Jun 25', amt: '₹ 64,000', status: 'completed', rowBg: '#111113' },
  ];

  const cards = [
    { label: 'Billed This Month', val: '₹ 24.80 L', color: '#F0F2F4' },
    { label: 'Collected', val: '₹ 18.95 L', color: '#4ADE80' },
    { label: 'Outstanding', val: '₹ 5.85 L', color: '#FFC840' },
    { label: 'Invoices Raised', val: '42', color: '#C8D0D8' },
  ];

  const invoice = {
    no: 'INV-1190', date: '14 Jun 2025', client: 'Mehta Jewels Pvt. Ltd.', city: 'Surat, Gujarat',
    gst: '24AABCM1234F1Z5', order: 'ORD-2241', rateLock: '₹ 88,900 / kg',
    lines: [
      { desc: 'Payal (Anklet) · 24 pc', gross: '820.500', fine: '779.475', making: '₹ 18,051', silverVal: '₹ 69,295', total: '₹ 87,346' },
      { desc: 'Bichiya (Toe Ring) · 50 pc', gross: '420.000', fine: '399.000', making: '₹ 8,400', silverVal: '₹ 35,471', total: '₹ 43,871' },
    ],
    sub: '₹ 1,31,217', cgst: '₹ 1,968', sgst: '₹ 1,968', grand: '₹ 1,35,153', outstanding: '₹ 1,35,153',
  };

  const chipC: Record<string, { bg: string; fg: string; label: string }> = {
    outstanding: { bg: 'rgba(138,98,0,.22)', fg: '#FFC840', label: 'Outstanding' },
    partial: { bg: 'rgba(37,99,235,.22)', fg: '#60A5FA', label: 'Partial' },
    completed: { bg: 'rgba(45,125,82,.18)', fg: '#4ADE80', label: 'Paid' },
    overdue: { bg: 'rgba(138,32,32,.24)', fg: '#F87171', label: 'Overdue' },
  };

  const th = { textAlign: 'left' as const, padding: '10px 16px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '.06em', color: '#8A9099', borderBottom: '1px solid #242428' };

  return (
    <div className="ss-page" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 600, color: '#F0F2F4', letterSpacing: '-.01em' }}>Billing</div>
          <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '3px' }}>Invoices with rate locked at order time · GST-ready</div>
        </div>
        <button onClick={() => setInvoiceOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '32px', padding: '0 14px', background: '#C8D0D8', color: '#0A0A0B', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', border: 'none' }}>
          <span style={{ fontSize: '15px', marginTop: '-1px' }}>+</span> New Invoice
        </button>
      </div>

      {/* Cards */}
      <div className="ss-g4">
        {cards.map(c => (
          <div key={c.label} style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', color: '#8A9099' }}>{c.label}</div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '22px', color: c.color, marginTop: '10px' }}>{c.val}</div>
          </div>
        ))}
      </div>

      {/* Invoice list */}
      <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead><tr style={{ background: '#18181C' }}>
              <th style={th}>Invoice</th><th style={th}>Client</th><th style={th}>Order</th><th style={th}>Date</th>
              <th style={{ ...th, textAlign: 'right' }}>Amount</th><th style={th}>Status</th><th style={{ ...th, textAlign: 'right' }}>Action</th>
            </tr></thead>
            <tbody>
              {invoices.map((iv, i) => {
                const chip = chipC[iv.status];
                return (
                  <tr key={iv.no} style={{ background: iv.rowBg }}>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", color: '#E2E8ED' }}>{iv.no}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', color: '#E2E8ED' }}>{iv.client}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", color: '#8A9099' }}>{iv.order}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", color: '#8A9099' }}>{iv.date}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#F0F2F4' }}>{iv.amt}</td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20' }}><span style={{ display: 'inline-flex', alignItems: 'center', height: '19px', padding: '0 7px', borderRadius: '4px', fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em', background: chip.bg, color: chip.fg }}>{chip.label}</span></td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', textAlign: 'right' }}>
                      <button onClick={() => setInvoiceOpen(true)} style={{ fontSize: '11px', color: '#60A5FA', cursor: 'pointer', background: 'transparent', border: 'none' }}>Preview →</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice preview drawer */}
      {invoiceOpen && (
        <>
          <div onClick={() => setInvoiceOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,.5)' }} />
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '520px', background: '#111113', borderLeft: '1px solid #242428', zIndex: 90, animation: 'ssDrawer .2s ease', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div><div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '16px', fontWeight: 600, color: '#F0F2F4' }}>{invoice.no}</div><div style={{ fontSize: '12px', color: '#8A9099', marginTop: '2px' }}>{invoice.date}</div></div>
              <button onClick={() => setInvoiceOpen(false)} style={{ background: 'transparent', border: 'none', color: '#8A9099', cursor: 'pointer', fontSize: '20px' }}>×</button>
            </div>
            <div style={{ background: '#0E0E10', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#F0F2F4' }}>{invoice.client}</div>
              <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '2px' }}>{invoice.city}</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: '#5a5a62', marginTop: '2px' }}>GST {invoice.gst}</div>
              <div style={{ marginTop: '10px', fontSize: '11px', color: '#8A9099' }}>Order: <span style={{ fontFamily: "'JetBrains Mono',monospace", color: '#C8D0D8' }}>{invoice.order}</span> · Rate: <span style={{ fontFamily: "'JetBrains Mono',monospace", color: '#C8D0D8' }}>{invoice.rateLock}</span></div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '16px' }}>
              <thead><tr style={{ background: '#18181C' }}>
                <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: '#8A9099', borderBottom: '1px solid #242428' }}>Item</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: '#8A9099', borderBottom: '1px solid #242428' }}>Fine</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: '#8A9099', borderBottom: '1px solid #242428' }}>Making</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: '#8A9099', borderBottom: '1px solid #242428' }}>Total</th>
              </tr></thead>
              <tbody>
                {invoice.lines.map((l, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#111113' : '#0E0E10' }}>
                    <td style={{ padding: '9px 10px', borderBottom: '1px solid #1C1C20', color: '#C8D0D8', fontSize: '12px' }}>{l.desc}</td>
                    <td style={{ padding: '9px 10px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#C8D0D8' }}>{l.fine}</td>
                    <td style={{ padding: '9px 10px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#8A9099' }}>{l.making}</td>
                    <td style={{ padding: '9px 10px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", textAlign: 'right', color: '#F0F2F4', fontWeight: 500 }}>{l.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: '#0E0E10', borderRadius: '8px', marginBottom: '16px' }}>
              {[{ l: 'Subtotal', v: invoice.sub }, { l: 'CGST 1.5%', v: invoice.cgst }, { l: 'SGST 1.5%', v: invoice.sgst }].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#8A9099' }}><span>{r.l}</span><span style={{ fontFamily: "'JetBrains Mono',monospace" }}>{r.v}</span></div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 600, color: '#F0F2F4', borderTop: '1px solid #242428', paddingTop: '8px', marginTop: '4px' }}><span>Grand Total</span><span style={{ fontFamily: "'JetBrains Mono',monospace" }}>{invoice.grand}</span></div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => showToast('Invoice sent to client')} style={{ flex: 1, height: '36px', background: '#C8D0D8', color: '#0A0A0B', border: 'none', borderRadius: '7px', fontWeight: 600, cursor: 'pointer' }}>Send Invoice</button>
              <button onClick={() => showToast('Invoice downloaded as PDF')} style={{ flex: 1, height: '36px', background: 'transparent', color: '#C8D0D8', border: '1px solid #242428', borderRadius: '7px', fontWeight: 500, cursor: 'pointer' }}>Download PDF</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
