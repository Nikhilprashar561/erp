'use client';
import React, { useEffect, useState } from 'react';
import { useInventoryStore } from '@/stores/useInventoryStore';
import { useUIStore } from '@/stores/useUIStore';
import { fmtGn, fmtINR } from '@/lib/formatters';
import AddSkuModal from '@/components/inventory/AddSkuModal';

const invStatus: Record<string, { label: string; bg: string; fg: string }> = {
  in: { label: 'In Stock', bg: 'rgba(45,125,82,.18)', fg: '#4ADE80' },
  low: { label: 'Low', bg: 'rgba(138,98,0,.22)', fg: '#FFC840' },
  reorder: { label: 'Reorder', bg: 'rgba(138,32,32,.22)', fg: '#F87171' },
};

export default function InventoryPage() {
  const { items, fetchInventory, auditStock, isLoading } = useInventoryStore();
  const rate = useUIStore((s) => s.rate);
  const showToast = useUIStore((s) => s.showToast);

  const [isAddSkuOpen, setIsAddSkuOpen] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const fg = items.filter((i) => !i.cat.toLowerCase().includes('raw')).reduce((a, i) => a + i.fine, 0);
  const raw = items.filter((i) => i.cat.toLowerCase().includes('raw')).reduce((a, i) => a + i.fine, 0);
  const totalFine = fg + raw;

  // Valuation based on live MCX rate
  const stockValuationINR = (totalFine / 1000) * (rate || 89000);
  const lowSkuCount = items.filter((i) => i.status === 'low' || i.status === 'reorder').length;

  const cards = [
    { label: 'Total Fine Silver', amt: fmtGn(totalFine) + ' g', accent: '#F0F2F4' },
    { label: 'Finished Goods', amt: fmtGn(fg) + ' g', accent: '#C8D0D8' },
    { label: 'Raw Silver', amt: fmtGn(raw) + ' g', accent: '#C8D0D8' },
    {
      label: 'Stock Value · live',
      amt: stockValuationINR >= 10000000
        ? `₹ ${(stockValuationINR / 10000000).toFixed(2)} Cr`
        : fmtINR(stockValuationINR),
      accent: '#4ADE80',
    },
    { label: 'Low / Reorder', amt: `${lowSkuCount} SKU`, accent: lowSkuCount > 0 ? '#FFC840' : '#8A9099' },
  ];

  const handleAudit = async () => {
    setIsAuditing(true);
    const res = await auditStock();
    setIsAuditing(false);
    if (res.success && res.data) {
      showToast(`Stock audit verified: ${fmtGn(res.data.totalFine)} g across ${res.data.skuCount} SKUs`);
    } else {
      showToast(res.error || 'Failed to audit stock');
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
          <div style={{ fontSize: '22px', fontWeight: 600, color: '#F0F2F4', letterSpacing: '-.01em' }}>Inventory</div>
          <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '3px' }}>
            {isLoading && items.length === 0
              ? 'Loading inventory from vaults...'
              : `${items.length} SKUs · Finished goods & raw silver by SKU, purity & location`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleAudit}
            disabled={isAuditing}
            style={{
              display: 'flex',
              alignItems: 'center',
              height: '32px',
              padding: '0 13px',
              border: '1px solid #242428',
              borderRadius: '6px',
              color: '#C8D0D8',
              fontWeight: 500,
              cursor: 'pointer',
              background: 'transparent',
              fontSize: '12px',
            }}
          >
            {isAuditing ? 'Auditing...' : 'Stock Audit'}
          </button>
          <button
            onClick={() => setIsAddSkuOpen(true)}
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
            <span style={{ fontSize: '14px', marginTop: '-1px' }}>+</span> Add SKU
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="ss-g5">
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
                fontSize: '20px',
                fontWeight: 600,
                color: c.accent,
              }}
            >
              {c.amt}
            </div>
          </div>
        ))}
      </div>

      {/* SKU Table */}
      <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#18181C' }}>
                <th style={th}>SKU</th>
                <th style={th}>Category</th>
                <th style={th}>Purity</th>
                <th style={{ ...th, textAlign: 'right' }}>Pieces</th>
                <th style={{ ...th, textAlign: 'right' }}>Gross</th>
                <th style={{ ...th, textAlign: 'right' }}>Fine</th>
                <th style={th}>Location</th>
                <th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#8A9099' }}>
                    {isLoading ? 'Loading stock data...' : 'No inventory SKUs registered.'}
                  </td>
                </tr>
              ) : (
                items.map((it, i) => {
                  const s = invStatus[it.status] || invStatus.in;
                  return (
                    <tr
                      key={it.sku || it.id}
                      style={{ background: i % 2 === 0 ? '#111113' : '#0E0E10' }}
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
                        {it.sku}
                      </td>
                      <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', color: '#C8D0D8' }}>
                        {it.cat}
                      </td>
                      <td
                        style={{
                          padding: '11px 16px',
                          borderBottom: '1px solid #1C1C20',
                          fontFamily: "'JetBrains Mono',monospace",
                          color: '#8A9099',
                        }}
                      >
                        {it.purity}
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
                        {it.pieces}
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
                        {fmtGn(it.gross)}
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
                        {fmtGn(it.fine)}
                      </td>
                      <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', color: '#8A9099' }}>
                        {it.loc}
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
                            background: s.bg,
                            color: s.fg,
                          }}
                        >
                          {s.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AddSkuModal isOpen={isAddSkuOpen} onClose={() => setIsAddSkuOpen(false)} />
    </div>
  );
}