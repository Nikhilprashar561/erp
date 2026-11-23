'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useOrderStore } from '@/stores/useOrderStore';
import { useUIStore } from '@/stores/useUIStore';
import { fmtG, fmtINR, fmtGn } from '@/lib/formatters';
import StatusChip from '@/components/ui/StatusChip';

const stepNames = ['Created', 'Production', 'QC', 'Dispatch', 'Completed'];

interface OrderDetailClientProps {
  id: string;
}

export default function OrderDetailClient({ id }: OrderDetailClientProps) {
  const router = useRouter();
  const { selectedOrder, fetchOrderById, updateOrderStatus, isLoading } = useOrderStore();
  const rate = useUIStore((s) => s.rate);
  const showToast = useUIStore((s) => s.showToast);

  const [isChangingStatus, setIsChangingStatus] = useState(false);

  useEffect(() => {
    fetchOrderById(id);
  }, [id, fetchOrderById]);

  if (isLoading && !selectedOrder) {
    return (
      <div className="ss-page" style={{ padding: '40px', textAlign: 'center', color: '#8A9099' }}>
        <div style={{ fontSize: '14px', marginBottom: '8px' }}>Loading order details...</div>
        <div style={{ fontSize: '11px', fontFamily: "'JetBrains Mono',monospace" }}>{id}</div>
      </div>
    );
  }

  if (!selectedOrder) {
    return (
      <div className="ss-page" style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '16px', color: '#F0F2F4', marginBottom: '8px' }}>Order not found</div>
        <div style={{ fontSize: '12px', color: '#8A9099', marginBottom: '16px' }}>
          Could not find order with reference &quot;{id}&quot;.
        </div>
        <button
          onClick={() => router.push('/orders')}
          style={{
            background: '#242428',
            color: '#E2E8ED',
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ← Back to Orders
        </button>
      </div>
    );
  }

  const od = selectedOrder;

  const stepIdx =
    ({
      production: 1,
      overdue: 1,
      hold: 1,
      qc: 2,
      dispatched: 3,
      completed: 4,
    } as Record<string, number>)[od.status] || 0;

  const handleStatusChange = async (newStatus: string) => {
    setIsChangingStatus(true);
    const res = await updateOrderStatus(od.id, newStatus);
    setIsChangingStatus(false);
    if (res.success) {
      showToast(`Order status updated to ${newStatus.toUpperCase()}`);
    } else {
      showToast(res.error || 'Failed to update status');
    }
  };

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
      <button
        onClick={() => router.push('/orders')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          color: '#8A9099',
          cursor: 'pointer',
          marginBottom: '14px',
          background: 'transparent',
          border: 'none',
        }}
      >
        ← Orders
      </button>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: '22px',
                fontWeight: 600,
                color: '#F0F2F4',
              }}
            >
              {od.no}
            </div>
            <StatusChip status={od.status} />
          </div>
          <div style={{ fontSize: '13px', color: '#C8D0D8', marginTop: '5px' }}>
            {od.client} · {od.clientCity || 'Surat'}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: '#8A9099',
              marginTop: '2px',
              fontFamily: "'JetBrains Mono',monospace",
            }}
          >
            GST {od.clientGst || '24AABCM1234F1Z5'} · {od.products}
          </div>
        </div>

        {/* Action Buttons & Status Changer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <select
            value={od.status}
            disabled={isChangingStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            style={{
              height: '32px',
              padding: '0 10px',
              border: '1px solid #33333a',
              borderRadius: '6px',
              background: '#18181C',
              color: '#E2E8ED',
              fontSize: '12px',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="production">Stage: In Production</option>
            <option value="qc">Stage: Pending QC</option>
            <option value="dispatched">Stage: Dispatched</option>
            <option value="completed">Stage: Completed</option>
            <option value="hold">Stage: On Hold</option>
            <option value="overdue">Stage: Overdue</option>
          </select>

          <button
            onClick={() => {
              router.push(`/production?order=${od.no}`);
              showToast(`Order ${od.no} routed to Production batch pipeline`);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              height: '32px',
              padding: '0 12px',
              background: '#1F1F24',
              color: '#E2E8ED',
              border: '1px solid #33333a',
              borderRadius: '6px',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            ⚙ Send to Production
          </button>

          <button
            onClick={() => {
              window.print();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              height: '32px',
              padding: '0 12px',
              background: '#141418',
              color: '#8A9099',
              border: '1px solid #242428',
              borderRadius: '6px',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Print Job Card
          </button>

          <button
            onClick={() => {
              router.push('/billing');
              showToast(`Invoice draft for ${od.no} loaded in Billing`);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
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
            Generate Bill
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#111113',
            border: '1px solid #242428',
            borderRadius: '8px',
            padding: '16px 20px',
            minWidth: '600px',
          }}
        >
          {stepNames.map((s, i) => (
            <React.Fragment key={s}>
              <div
                style={{
                  display: 'flex',
                  flex: i < stepNames.length - 1 ? undefined : 'none',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  minWidth: '60px',
                }}
              >
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    flexShrink: 0,
                    border: i <= stepIdx ? '2px solid #C8D0D8' : '2px solid #2a2a30',
                    background: i < stepIdx ? '#C8D0D8' : i === stepIdx ? '#0A0A0B' : 'transparent',
                    boxShadow: i === stepIdx ? '0 0 0 3px rgba(200,208,216,.18)' : 'none',
                  }}
                />
                <span style={{ fontSize: '10px', color: i <= stepIdx ? '#E2E8ED' : '#8A9099', whiteSpace: 'nowrap' }}>
                  {s}
                </span>
              </div>
              {i < stepNames.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: '2px',
                    background: i < stepIdx ? '#C8D0D8' : '#242428',
                    minWidth: '20px',
                    marginBottom: '16px',
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Value Strip */}
      <div className="ss-g4" style={{ marginBottom: '16px' }}>
        {[
          { label: 'Total Gross', val: fmtG(od.gross) },
          { label: 'Total Fine', val: fmtG(od.fine) },
          {
            label: 'Rate Locked',
            val: `₹ ${od.rateLocked.toLocaleString('en-IN')} / kg`,
            sub: `Live MCX ₹ ${rate.toLocaleString('en-IN')}`,
            badge: 'LOCKED',
          },
          { label: 'Order Value', val: fmtINR(od.outI || od.fine * (od.rateLocked / 1000)) },
        ].map((c) => (
          <div
            key={c.label}
            style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '13px 16px' }}
          >
            <div style={{ fontSize: '11px', color: '#8A9099', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {c.label}{' '}
              {c.badge && (
                <span
                  style={{
                    fontSize: '9px',
                    color: '#C8D0D8',
                    border: '1px solid #33333a',
                    borderRadius: '3px',
                    padding: '0 4px',
                  }}
                >
                  {c.badge}
                </span>
              )}
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: '18px',
                color: '#E2E8ED',
                marginTop: '6px',
              }}
            >
              {c.val}
            </div>
            {c.sub && (
              <div
                style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: '10px',
                  color: '#8A9099',
                  marginTop: '2px',
                }}
              >
                {c.sub}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="ss-panel-r">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Order Items */}
          <div
            style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', overflow: 'hidden' }}
          >
            <div
              style={{
                padding: '12px 16px',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '.08em',
                color: '#8A9099',
                borderBottom: '1px solid #1C1C20',
              }}
            >
              Order Line Items ({od.items?.length || 0})
            </div>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', minWidth: '550px', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th style={th}>Item</th>
                    <th style={{ ...th, textAlign: 'right' }}>Gross</th>
                    <th style={{ ...th, textAlign: 'right' }}>Fine</th>
                    <th style={{ ...th, textAlign: 'right' }}>Making</th>
                    <th style={{ ...th, textAlign: 'right' }}>Silver Val</th>
                    <th style={{ ...th, textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {!od.items || od.items.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '16px', textAlign: 'center', color: '#8A9099' }}>
                        No line items recorded.
                      </td>
                    </tr>
                  ) : (
                    od.items.map((p, i) => (
                      <tr key={p.id || i} style={{ background: i % 2 === 0 ? '#111113' : '#0E0E10' }}>
                        <td style={{ padding: '10px 14px', borderBottom: '1px solid #1C1C20', color: '#C8D0D8' }}>
                          {p.name}
                        </td>
                        <td
                          style={{
                            padding: '10px 14px',
                            borderBottom: '1px solid #1C1C20',
                            fontFamily: "'JetBrains Mono',monospace",
                            textAlign: 'right',
                            color: '#C8D0D8',
                          }}
                        >
                          {fmtGn(p.gross)}
                        </td>
                        <td
                          style={{
                            padding: '10px 14px',
                            borderBottom: '1px solid #1C1C20',
                            fontFamily: "'JetBrains Mono',monospace",
                            textAlign: 'right',
                            color: '#C8D0D8',
                          }}
                        >
                          {fmtGn(p.fine)}
                        </td>
                        <td
                          style={{
                            padding: '10px 14px',
                            borderBottom: '1px solid #1C1C20',
                            fontFamily: "'JetBrains Mono',monospace",
                            textAlign: 'right',
                            color: '#8A9099',
                          }}
                        >
                          {fmtINR(p.making)}
                        </td>
                        <td
                          style={{
                            padding: '10px 14px',
                            borderBottom: '1px solid #1C1C20',
                            fontFamily: "'JetBrains Mono',monospace",
                            textAlign: 'right',
                            color: '#8A9099',
                          }}
                        >
                          {fmtINR(p.silverVal)}
                        </td>
                        <td
                          style={{
                            padding: '10px 14px',
                            borderBottom: '1px solid #1C1C20',
                            fontFamily: "'JetBrains Mono',monospace",
                            textAlign: 'right',
                            color: '#F0F2F4',
                            fontWeight: 500,
                          }}
                        >
                          {fmtINR(p.total)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Linked Batches / Floor Progress */}
          <div
            style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '14px 16px' }}
          >
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
              Floor Batches & Traceability ({od.batches?.length || 0})
            </div>
            {!od.batches || od.batches.length === 0 ? (
              <div style={{ fontSize: '12px', color: '#8A9099', padding: '8px 0' }}>
                No active batches in production floor for this order.
              </div>
            ) : (
              od.batches.map((b, i) => (
                <div
                  key={b.bid || i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderTop: i > 0 ? '1px solid #1C1C20' : undefined,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: '12px',
                        color: '#60A5FA',
                        fontWeight: 500,
                      }}
                    >
                      {b.bid}
                    </span>
                    <span style={{ fontSize: '12px', color: '#C8D0D8' }}>
                      {b.product} · <span style={{ textTransform: 'capitalize' }}>{b.stage}</span>
                    </span>
                    {b.delay && (
                      <span
                        style={{
                          fontSize: '10px',
                          color: '#F87171',
                          background: 'rgba(248,113,113,.12)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        Delayed
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: '12px',
                      color: '#E2E8ED',
                      fontWeight: 500,
                    }}
                  >
                    {fmtG(b.weight)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Client Profile Box */}
        <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '16px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '.08em',
              color: '#8A9099',
              marginBottom: '14px',
            }}
          >
            Client Profile
          </div>
          <div style={{ fontWeight: 600, fontSize: '14px', color: '#F0F2F4', marginBottom: '4px' }}>{od.client}</div>
          <div style={{ fontSize: '12px', color: '#8A9099', marginBottom: '2px' }}>{od.clientCity || 'Surat'}</div>
          <div
            style={{
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: '11px',
              color: '#5a5a62',
              marginBottom: '16px',
            }}
          >
            {od.clientGst || '24AABCM1234F1Z5'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ background: '#18181C', borderRadius: '6px', padding: '10px 12px' }}>
              <div style={{ fontSize: '10px', color: '#8A9099', marginBottom: '4px' }}>Client Silver Out</div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: '13px',
                  color: od.clientSilverOut > 0 ? '#FFC840' : '#C8D0D8',
                }}
              >
                {fmtG(od.clientSilverOut || od.outS)}
              </div>
            </div>

            <div style={{ background: '#18181C', borderRadius: '6px', padding: '10px 12px' }}>
              <div style={{ fontSize: '10px', color: '#8A9099', marginBottom: '4px' }}>Client INR Out</div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: '13px',
                  color: od.clientInrOut > 0 ? '#F87171' : '#C8D0D8',
                }}
              >
                {fmtINR(od.clientInrOut || od.outI)}
              </div>
            </div>
          </div>

          <Link
            href="/clients"
            style={{
              display: 'inline-block',
              marginTop: '16px',
              fontSize: '11px',
              color: '#60A5FA',
              textDecoration: 'none',
            }}
          >
            View client in Directory →
          </Link>
        </div>
      </div>
    </div>
  );
}