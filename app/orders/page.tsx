'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useOrderStore } from '@/stores/useOrderStore';
import { useUIStore } from '@/stores/useUIStore';
import { fmtGn, fmtINRn } from '@/lib/formatters';
import StatusChip from '@/components/ui/StatusChip';
import NewOrderModal from '@/components/orders/NewOrderModal';

const filterDefs = ['all', 'production', 'qc', 'dispatched', 'overdue', 'hold', 'completed'];
const filterLabels: Record<string, string> = {
  all: 'All',
  production: 'In Production',
  qc: 'Pending QC',
  dispatched: 'Dispatched',
  overdue: 'Overdue',
  hold: 'On Hold',
  completed: 'Completed',
};

export default function OrdersPage() {
  const { orders, orderFilter, setOrderFilter, fetchOrders, isLoading } = useOrderStore();
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const counts: Record<string, number> = { all: orders.length };
  ['production', 'qc', 'dispatched', 'overdue', 'hold', 'completed'].forEach((k) => {
    counts[k] = orders.filter((o) => o.status === k).length;
  });

  const q = searchQuery.toLowerCase().trim();
  const visible = orders.filter((o) => {
    const matchesFilter = orderFilter === 'all' || o.status === orderFilter;
    const matchesQuery =
      !q ||
      o.no.toLowerCase().includes(q) ||
      o.client.toLowerCase().includes(q) ||
      o.products.toLowerCase().includes(q);
    return matchesFilter && matchesQuery;
  });
  const th = {
    textAlign: 'left' as const,
    padding: '11px 16px',
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '.07em',
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
          marginBottom: '16px',
        }}
      >
        <div>
          <div style={{ fontSize: '22px', fontWeight: 600, color: '#F0F2F4', letterSpacing: '-.01em' }}>Orders</div>
          <div
            style={{
              fontSize: '12px',
              color: '#8A9099',
              marginTop: '3px',
              fontFamily: "'JetBrains Mono',monospace",
            }}
          >
            {isLoading && orders.length === 0 ? 'Loading orders from database...' : `${visible.length} orders shown`}
          </div>
        </div>
        <button
          onClick={() => setIsNewOrderModalOpen(true)}
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
          <span style={{ fontSize: '15px', marginTop: '-1px' }}>+</span> New Order
        </button>
      </div>

      {/* Filters & Search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {filterDefs.map((f) => {
            const active = orderFilter === f;
            return (
              <button
                key={f}
                onClick={() => setOrderFilter(f)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  height: '28px',
                  padding: '0 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  border: '1px solid',
                  borderColor: active ? '#33333a' : '#1C1C20',
                  background: active ? '#18181C' : 'transparent',
                  color: active ? '#E2E8ED' : '#8A9099',
                }}
              >
                {filterLabels[f]}{' '}
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: '#8A9099' }}>
                  {counts[f] || 0}
                </span>
              </button>
            );
          })}
        </div>
        <div style={{ minWidth: '220px' }}>
          <input
            type="text"
            placeholder="Search order no, client, item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: '#111113',
              border: '1px solid #242428',
              borderRadius: '6px',
              padding: '5px 12px',
              fontSize: '12px',
              color: '#E2E8ED',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '980px' }}>
            <thead>
              <tr style={{ background: '#18181C' }}>
                <th style={th}>Order No.</th>
                <th style={th}>Client</th>
                <th style={th}>Products</th>
                <th style={{ ...th, textAlign: 'right' }}>Gross Wt</th>
                <th style={{ ...th, textAlign: 'right' }}>Fine Wt</th>
                <th style={th}>Status</th>
                <th style={th}>Due</th>
                <th style={{ ...th, textAlign: 'right' }}>Out · Silver</th>
                <th style={{ ...th, textAlign: 'right' }}>Out · INR</th>
                <th style={{ ...th, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '32px', textAlign: 'center', color: '#8A9099' }}>
                    {isLoading ? 'Loading orders...' : 'No orders found for selected filter.'}
                  </td>
                </tr>
              ) : (
                visible.map((o, i) => (
                  <tr
                    key={o.no || o.id}
                    style={{ background: i % 2 === 0 ? '#111113' : '#0E0E10', cursor: 'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#1C1C22')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? '#111113' : '#0E0E10')}
                  >
                    <td
                      style={{
                        padding: '11px 16px',
                        borderBottom: '1px solid #1C1C20',
                        fontFamily: "'JetBrains Mono',monospace",
                        color: '#E2E8ED',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {o.no}
                    </td>
                    <td
                      style={{
                        padding: '11px 16px',
                        borderBottom: '1px solid #1C1C20',
                        color: '#E2E8ED',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {o.client}
                    </td>
                    <td
                      style={{
                        padding: '11px 16px',
                        borderBottom: '1px solid #1C1C20',
                        color: '#8A9099',
                        whiteSpace: 'nowrap',
                        maxWidth: '220px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {o.products}
                    </td>
                    <td
                      style={{
                        padding: '11px 16px',
                        borderBottom: '1px solid #1C1C20',
                        fontFamily: "'JetBrains Mono',monospace",
                        fontVariantNumeric: 'tabular-nums',
                        textAlign: 'right',
                        color: '#C8D0D8',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {fmtGn(o.gross)}
                    </td>
                    <td
                      style={{
                        padding: '11px 16px',
                        borderBottom: '1px solid #1C1C20',
                        fontFamily: "'JetBrains Mono',monospace",
                        fontVariantNumeric: 'tabular-nums',
                        textAlign: 'right',
                        color: '#C8D0D8',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {fmtGn(o.fine)}
                    </td>
                    <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', whiteSpace: 'nowrap' }}>
                      <StatusChip status={o.status} />
                    </td>
                    <td
                      style={{
                        padding: '11px 16px',
                        borderBottom: '1px solid #1C1C20',
                        fontFamily: "'JetBrains Mono',monospace",
                        color: '#8A9099',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {o.due}
                    </td>
                    <td
                      style={{
                        padding: '11px 16px',
                        borderBottom: '1px solid #1C1C20',
                        fontFamily: "'JetBrains Mono',monospace",
                        fontVariantNumeric: 'tabular-nums',
                        textAlign: 'right',
                        color: '#C8D0D8',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {o.outS ? fmtGn(o.outS) : '—'}
                    </td>
                    <td
                      style={{
                        padding: '11px 16px',
                        borderBottom: '1px solid #1C1C20',
                        fontFamily: "'JetBrains Mono',monospace",
                        fontVariantNumeric: 'tabular-nums',
                        textAlign: 'right',
                        color: '#C8D0D8',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {o.outI ? fmtINRn(o.outI) : '—'}
                    </td>
                    <td
                      style={{
                        padding: '11px 16px',
                        borderBottom: '1px solid #1C1C20',
                        textAlign: 'right',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Link href={`/orders/${o.no}`} style={{ fontSize: '11px', color: '#60A5FA', textDecoration: 'none' }}>
                        Open →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <NewOrderModal isOpen={isNewOrderModalOpen} onClose={() => setIsNewOrderModalOpen(false)} />
    </div>
  );
}