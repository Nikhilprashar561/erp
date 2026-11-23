'use client';
import React from 'react';
import type { InvoiceModel } from '@/stores/useBillingStore';
import { fmtGn, fmtINR, fmtINRn } from '@/lib/formatters';

interface PrintTaxInvoiceProps {
  invoice: InvoiceModel | null;
}

export default function PrintTaxInvoice({ invoice }: PrintTaxInvoiceProps) {
  if (!invoice) return null;

  const invoiceDate = invoice.date || '23/11/2026';
  const subtotal = invoice.subtotal || 0;
  const cgst = invoice.cgst || (subtotal * 0.015);
  const sgst = invoice.sgst || (subtotal * 0.015);
  const grandTotal = invoice.grandTotal || (subtotal + cgst + sgst);

  return (
    <div id="print-tax-invoice" className="ss-print-only" style={{ fontFamily: "'Inter', sans-serif", color: '#000', background: '#fff', fontSize: '11px', lineHeight: 1.4 }}>
      {/* Header Container */}
      <div style={{ border: '2px solid #000', padding: '16px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #000', paddingBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '0.05em' }}>SILVER SUITE PRIVATE LIMITED</div>
            <div style={{ fontSize: '11px', marginTop: '2px' }}>Manufacturers & Wholesalers of 925 Sterling Silver Jewellery & Utensils</div>
            <div style={{ fontSize: '10px', color: '#333', marginTop: '4px' }}>
              Factory & Vault: 42, Zaveri Bazaar, Kalbadevi, Mumbai - 400002, Maharashtra, India
            </div>
            <div style={{ fontSize: '10px', fontWeight: 600, marginTop: '2px' }}>
              GSTIN: 27AABCS1234F1Z1 | PAN: AABCS1234F | State Code: 27 (Maharashtra)
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', border: '1px solid #000', padding: '4px 10px', display: 'inline-block' }}>
              TAX INVOICE
            </div>
            <div style={{ fontSize: '10px', marginTop: '4px', fontStyle: 'italic' }}>Original for Recipient</div>
          </div>
        </div>

        {/* Invoice & Client Information Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingTop: '10px' }}>
          {/* Bill To */}
          <div style={{ borderRight: '1px solid #ccc', paddingRight: '12px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#444' }}>BILLED TO:</div>
            <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>{invoice.client}</div>
            <div style={{ fontSize: '11px', marginTop: '2px' }}>{invoice.city || 'Surat, Gujarat'}</div>
            <div style={{ fontSize: '11px', marginTop: '4px' }}>
              <strong>GSTIN:</strong> {invoice.gst || 'Not Registered / Unregistered'}
            </div>
            <div style={{ fontSize: '11px' }}>
              <strong>Place of Supply:</strong> {invoice.city ? invoice.city + ' (State Code 24)' : 'Maharashtra (27)'}
            </div>
          </div>

          {/* Invoice Meta */}
          <div style={{ paddingLeft: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', rowGap: '4px', fontSize: '11px' }}>
              <span style={{ fontWeight: 600 }}>Invoice No:</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{invoice.no}</span>
              <span style={{ fontWeight: 600 }}>Invoice Date:</span>
              <span>{invoiceDate}</span>
              <span style={{ fontWeight: 600 }}>Order Reference:</span>
              <span style={{ fontFamily: 'monospace' }}>{invoice.order || '—'}</span>
              <span style={{ fontWeight: 600 }}>Silver Rate Lock:</span>
              <span>{invoice.rateLock || '₹ 89,000 / kg (Spot Locked)'}</span>
              <span style={{ fontWeight: 600 }}>Reverse Charge:</span>
              <span>No</span>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Goods Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '8px', fontSize: '10.5px' }}>
        <thead>
          <tr style={{ background: '#f2f2f2', borderBottom: '1.5px solid #000' }}>
            <th style={{ border: '1px solid #000', padding: '6px', width: '30px', textAlign: 'center' }}>#</th>
            <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'left' }}>Description of Jewellery Articles</th>
            <th style={{ border: '1px solid #000', padding: '6px', width: '65px', textAlign: 'center' }}>HSN Code</th>
            <th style={{ border: '1px solid #000', padding: '6px', width: '55px', textAlign: 'center' }}>Purity</th>
            <th style={{ border: '1px solid #000', padding: '6px', width: '80px', textAlign: 'right' }}>Fine Wt (g)</th>
            <th style={{ border: '1px solid #000', padding: '6px', width: '90px', textAlign: 'right' }}>Metal Value (₹)</th>
            <th style={{ border: '1px solid #000', padding: '6px', width: '85px', textAlign: 'right' }}>Making Chgs (₹)</th>
            <th style={{ border: '1px solid #000', padding: '6px', width: '95px', textAlign: 'right' }}>Total Taxable (₹)</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lines.map((line, idx) => {
            const metalVal = (line.fine / 1000) * 89000;
            return (
              <tr key={line.id || idx}>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{idx + 1}</td>
                <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 600 }}>{line.desc}</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontFamily: 'monospace' }}>711311</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>92.5%</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right', fontFamily: 'monospace' }}>{fmtGn(line.fine)}</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right', fontFamily: 'monospace' }}>{fmtINRn(metalVal)}</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right', fontFamily: 'monospace' }}>{fmtINRn(line.making)}</td>
                <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'right', fontWeight: 600, fontFamily: 'monospace' }}>{fmtINRn(line.total)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Calculations & Dual Ledger Settlement Box */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px', marginBottom: '8px' }}>
        {/* Left: Bank Details & Dual Ledger Note */}
        <div style={{ border: '1px solid #000', padding: '10px', fontSize: '10px' }}>
          <div style={{ fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Bank Transfer Details:</div>
          <div>Bank Name: <strong>HDFC Bank Ltd</strong></div>
          <div>Account Name: <strong>Silver Suite Private Limited</strong></div>
          <div>Account Number: <strong>50200088992211</strong> (Current Account)</div>
          <div>IFSC Code: <strong>HDFC0000123</strong> | Branch: Zaveri Bazaar, Mumbai</div>

          <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed #aaa' }}>
            <div style={{ fontWeight: 700 }}>Dual Ledger Settlement Status:</div>
            <div>Metal Settlement: Debited to Client Pure Silver Account</div>
            <div>Payment Terms: Immediate payment upon invoice delivery</div>
          </div>
        </div>

        {/* Right: Tax Breakdown */}
        <div style={{ border: '1px solid #000', padding: '10px', fontSize: '11px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Total Taxable Value:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{fmtINRn(subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>CGST @ 1.5%:</span>
            <span style={{ fontFamily: 'monospace' }}>{fmtINRn(cgst)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>SGST @ 1.5%:</span>
            <span style={{ fontFamily: 'monospace' }}>{fmtINRn(sgst)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid #000', paddingTop: '6px', marginTop: '6px', fontSize: '13px', fontWeight: 800 }}>
            <span>Grand Total (INR):</span>
            <span style={{ fontFamily: 'monospace' }}>{fmtINR(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Terms & Authorized Signatory */}
      <div style={{ border: '1px solid #000', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', minHeight: '80px' }}>
        <div style={{ maxWidth: '60%', fontSize: '9px', color: '#444' }}>
          <div style={{ fontWeight: 700, color: '#000', marginBottom: '2px' }}>Terms & Conditions:</div>
          <div>1. Purity of 925 Silver articles is certified under BIS hallmarking guidelines.</div>
          <div>2. Weight tolerance and testing strictly as per standard jewellery manufacturing norms.</div>
          <div>3. Interest @ 18% p.a. will be charged if payment is not settled within credit cycle.</div>
          <div>4. All disputes are subject to Mumbai Jurisdiction only.</div>
        </div>
        <div style={{ textAlign: 'center', minWidth: '170px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700 }}>For SILVER SUITE PRIVATE LIMITED</div>
          <div style={{ height: '38px' }} />
          <div style={{ borderTop: '1px solid #000', fontSize: '10px', paddingTop: '2px', fontWeight: 600 }}>
            Authorised Signatory
          </div>
        </div>
      </div>
    </div>
  );
}
