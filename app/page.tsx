'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store/AppContext';
import { orders, clients, batches } from '@/lib/data';
import { statusMeta, fmtG, fmtGn, fmtINR } from '@/lib/formatters';
import MiniChart from '@/components/ui/MiniChart';
import StatusChip from '@/components/ui/StatusChip';
import Icon from '@/components/ui/Icon';
import DraggableDashboardCard from '@/components/dashboard/DraggableDashboardCard';

const S = statusMeta;

// Silver movement chart data (30 days)
function seed(i: number, a: number, b: number, p: number) {
  return a + (b - a) * (0.5 + 0.5 * Math.sin(i * p + 1.3)) * (0.7 + 0.3 * Math.sin(i * 0.7));
}
const inData = Array.from({ length: 30 }, (_, i) => seed(i, 40, 95, 0.5));
const outData = Array.from({ length: 30 }, (_, i) => seed(i, 25, 70, 0.42));

const DEFAULT_CARD_ORDER = [
  'kpi-todays-orders',
  'kpi-silver-issued',
  'kpi-silver-received',
  'kpi-outstanding-silver',
  'kpi-outstanding-inr',
  'ops-orders-in-production',
  'ops-outsourced-pending',
  'ops-pending-qc-dispatch',
  'fin-todays-collections',
  'fin-profit-this-month',
  'fin-silver-movement-30d',
  'intel-top-clients',
  'intel-alert-centre',
  'intel-recent-activity',
];

export default function Dashboard() {
  const { rate } = useApp();
  const todayStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const [cardOrder, setCardOrder] = useState<string[]>(DEFAULT_CARD_ORDER);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('silversuite_dashboard_layout_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter(id => DEFAULT_CARD_ORDER.includes(id));
          const missing = DEFAULT_CARD_ORDER.filter(id => !valid.includes(id));
          setCardOrder([...valid, ...missing]);
        }
      }
    } catch {
      // fallback to default
    }
  }, []);

  const isCustomized = mounted && JSON.stringify(cardOrder) !== JSON.stringify(DEFAULT_CARD_ORDER);

  const handleDragStart = (id: string) => {
    setActiveDragId(id);
  };

  const handleDragOver = (id: string, e: React.DragEvent) => {
    if (!activeDragId || activeDragId === id) return;

    // Real-time live reordering during drag
    setCardOrder(prev => {
      const fromIdx = prev.indexOf(activeDragId);
      const toIdx = prev.indexOf(id);
      if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return prev;

      const updated = [...prev];
      const [moved] = updated.splice(fromIdx, 1);
      updated.splice(toIdx, 0, moved);
      return updated;
    });

    setDragOverId(id);
  };

  const handleDrop = (targetId: string) => {
    if (!activeDragId) return;
    try {
      localStorage.setItem('silversuite_dashboard_layout_v1', JSON.stringify(cardOrder));
    } catch {
      // ignore storage errors
    }
    setActiveDragId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    if (activeDragId) {
      try {
        localStorage.setItem('silversuite_dashboard_layout_v1', JSON.stringify(cardOrder));
      } catch {
        // ignore
      }
    }
    setActiveDragId(null);
    setDragOverId(null);
  };

  const handleResetLayout = () => {
    setCardOrder(DEFAULT_CARD_ORDER);
    try {
      localStorage.removeItem('silversuite_dashboard_layout_v1');
    } catch {
      // ignore
    }
  };

  const kpis = [
    { id: 'kpi-todays-orders', label: "Today's Orders", value: '18', unit: '', sub: '6 clients', delta: '+4', deltaColor: '#4ADE80' },
    { id: 'kpi-silver-issued', label: 'Silver Issued', value: '2,340.000', unit: 'g', sub: 'today', delta: '', deltaColor: '#8A9099' },
    { id: 'kpi-silver-received', label: 'Silver Received', value: '1,890.500', unit: 'g', sub: 'today', delta: '', deltaColor: '#8A9099' },
    { id: 'kpi-outstanding-silver', label: 'Outstanding Silver', value: '1,150.500', unit: 'g', sub: '14 clients', delta: '▲ 6%', deltaColor: '#FFC840' },
    { id: 'kpi-outstanding-inr', label: 'Outstanding INR', value: '₹ 38.42 L', unit: '', sub: '14 clients', delta: '▼ 3%', deltaColor: '#4ADE80' },
  ];

  const prodOrders = orders.filter(o => o.status === 'production' || o.status === 'qc' || o.status === 'overdue').slice(0, 5);

  const pendingJobs = [
    { worker: 'Deepak Casting Unit', ref: 'JOB-901', outStr: '300.000 g', due: '15 Jun', status: 'overdue' },
    { worker: 'Imran Stone Setting', ref: 'JOB-905', outStr: '50.000 g', due: '11 Jun', status: 'overdue' },
    { worker: 'Suresh Polishing', ref: 'JOB-907', outStr: '120.000 g', due: '18 Jun', status: 'production' },
    { worker: 'Bharat Plating Co.', ref: 'JOB-906', outStr: '56.000 g', due: '18 Jun', status: 'production' },
  ];

  const qcBatches = [...batches.filter(b => b.stage === 'qc' || b.stage === 'dispatch'), ...batches.filter(b => b.stage === 'polishing')].slice(0, 4);

  const topClients = [...clients].sort((a, b) => (b.inrOut + b.silverOut * 800) - (a.inrOut + a.silverOut * 800)).slice(0, 5).map((c, i) => ({
    rank: i + 1, name: c.name, value: fmtINR((6 - i) * 180000 + 220000),
    outStr: c.silverOut > 0 ? fmtGn(c.silverOut) + ' g' : '0 g', id: c.id,
  }));

  const alerts = [
    { text: 'Shree Ganesh — payment overdue 6d', metric: '₹5.12L', dot: '#F87171' },
    { text: 'Imran Stone Setting — 2 jobs overdue', metric: '88g', dot: '#F87171' },
    { text: 'Bharat Plating — silver aging 31d', metric: '40g', dot: '#FFC840' },
    { text: 'Rod stock below reorder level', metric: 'Low', dot: '#FFC840' },
    { text: 'ORD-2240 QC hold — 1 reject', metric: 'Hold', dot: '#C084FC' },
  ];

  const activity = [
    { text: 'Silver received · Mehta Jewels · 450.000 g', time: '12:18 PM', dot: '#4ADE80' },
    { text: 'Invoice INV-1190 generated · ₹2,34,000', time: '11:02 AM', dot: '#60A5FA' },
    { text: 'BATCH-550 moved to QC', time: '10:40 AM', dot: '#C8D0D8' },
    { text: 'Payment received · Kalyan · ₹1,50,000', time: '09:30 AM', dot: '#4ADE80' },
    { text: 'Job JOB-895 returned · Deepak Casting', time: '08:55 AM', dot: '#8A9099' },
  ];

  const cardStyle = { background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '15px 17px', height: '100%' };
  const label11 = { fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '.08em', color: '#8A9099' };

  // Card render dictionary mapping each ID to its 60-col grid span & render function
  const cardMap: Record<string, { spanClass: string; render: () => React.ReactNode }> = {
    'kpi-todays-orders': {
      spanClass: 'ss-span-kpi',
      render: () => {
        const k = kpis[0];
        return (
          <div style={{ ...cardStyle, padding: '14px 16px' }}>
            <div style={label11}>{k.label}</div>
            <div style={{ marginTop: '13px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontVariantNumeric: 'tabular-nums', fontSize: '27px', fontWeight: 600, color: '#F0F2F4', letterSpacing: '-.02em' }}>{k.value}</span>
              <span style={{ fontSize: '13px', color: '#8A9099', fontFamily: "'JetBrains Mono',monospace" }}>{k.unit}</span>
            </div>
            <div style={{ marginTop: '7px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: k.deltaColor }}>{k.delta}</span>
              <span style={{ fontSize: '12px', color: '#8A9099' }}>{k.sub}</span>
            </div>
          </div>
        );
      },
    },
    'kpi-silver-issued': {
      spanClass: 'ss-span-kpi',
      render: () => {
        const k = kpis[1];
        return (
          <div style={{ ...cardStyle, padding: '14px 16px' }}>
            <div style={label11}>{k.label}</div>
            <div style={{ marginTop: '13px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontVariantNumeric: 'tabular-nums', fontSize: '27px', fontWeight: 600, color: '#F0F2F4', letterSpacing: '-.02em' }}>{k.value}</span>
              <span style={{ fontSize: '13px', color: '#8A9099', fontFamily: "'JetBrains Mono',monospace" }}>{k.unit}</span>
            </div>
            <div style={{ marginTop: '7px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: '#8A9099' }}>{k.sub}</span>
            </div>
          </div>
        );
      },
    },
    'kpi-silver-received': {
      spanClass: 'ss-span-kpi',
      render: () => {
        const k = kpis[2];
        return (
          <div style={{ ...cardStyle, padding: '14px 16px' }}>
            <div style={label11}>{k.label}</div>
            <div style={{ marginTop: '13px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontVariantNumeric: 'tabular-nums', fontSize: '27px', fontWeight: 600, color: '#F0F2F4', letterSpacing: '-.02em' }}>{k.value}</span>
              <span style={{ fontSize: '13px', color: '#8A9099', fontFamily: "'JetBrains Mono',monospace" }}>{k.unit}</span>
            </div>
            <div style={{ marginTop: '7px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: '#8A9099' }}>{k.sub}</span>
            </div>
          </div>
        );
      },
    },
    'kpi-outstanding-silver': {
      spanClass: 'ss-span-kpi',
      render: () => {
        const k = kpis[3];
        return (
          <div style={{ ...cardStyle, padding: '14px 16px' }}>
            <div style={label11}>{k.label}</div>
            <div style={{ marginTop: '13px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontVariantNumeric: 'tabular-nums', fontSize: '27px', fontWeight: 600, color: '#F0F2F4', letterSpacing: '-.02em' }}>{k.value}</span>
              <span style={{ fontSize: '13px', color: '#8A9099', fontFamily: "'JetBrains Mono',monospace" }}>{k.unit}</span>
            </div>
            <div style={{ marginTop: '7px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: k.deltaColor }}>{k.delta}</span>
              <span style={{ fontSize: '12px', color: '#8A9099' }}>{k.sub}</span>
            </div>
          </div>
        );
      },
    },
    'kpi-outstanding-inr': {
      spanClass: 'ss-span-kpi',
      render: () => {
        const k = kpis[4];
        return (
          <div style={{ ...cardStyle, padding: '14px 16px' }}>
            <div style={label11}>{k.label}</div>
            <div style={{ marginTop: '13px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontVariantNumeric: 'tabular-nums', fontSize: '27px', fontWeight: 600, color: '#F0F2F4', letterSpacing: '-.02em' }}>{k.value}</span>
            </div>
            <div style={{ marginTop: '7px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: k.deltaColor }}>{k.delta}</span>
              <span style={{ fontSize: '12px', color: '#8A9099' }}>{k.sub}</span>
            </div>
          </div>
        );
      },
    },
    'ops-orders-in-production': {
      spanClass: 'ss-span-ops-1',
      render: () => (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '13px', paddingRight: '20px' }}>
            <div style={label11}>Orders in Production</div>
            <Link href="/orders" style={{ fontSize: '11px', color: '#60A5FA' }}>View all →</Link>
          </div>
          {prodOrders.map(o => (
            <Link key={o.no} href={`/orders/${o.no}`} style={{ display: 'block', padding: '9px 0', borderTop: '1px solid #1C1C20', textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: '#8A9099' }}>{o.no}</span>
                  <span style={{ fontSize: '13px', color: '#E2E8ED', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.client}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: '#8A9099' }}>due {o.due}</span>
                  <StatusChip status={o.status} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '7px' }}>
                <div style={{ flex: 1, height: '4px', background: '#18181C', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#C8D0D8', borderRadius: '3px', width: o.prog + '%' }} />
                </div>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', color: '#8A9099', width: '30px', textAlign: 'right' }}>{o.prog}%</span>
              </div>
            </Link>
          ))}
        </div>
      ),
    },
    'ops-outsourced-pending': {
      spanClass: 'ss-span-ops-2',
      render: () => (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '13px', paddingRight: '20px' }}>
            <div style={label11}>Outsourced · Pending</div>
            <Link href="/outsourcing" style={{ fontSize: '11px', color: '#60A5FA' }}>View all →</Link>
          </div>
          {pendingJobs.map(j => (
            <div key={j.ref} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '9px 0', borderTop: '1px solid #1C1C20' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '13px', color: '#E2E8ED', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{j.worker}</div>
                <div style={{ fontSize: '11px', color: '#8A9099', fontFamily: "'JetBrains Mono',monospace", marginTop: '2px' }}>{j.ref} · out {j.outStr}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: '#8A9099' }}>{j.due}</div>
                <StatusChip status={j.status} />
              </div>
            </div>
          ))}
        </div>
      ),
    },
    'ops-pending-qc-dispatch': {
      spanClass: 'ss-span-ops-3',
      render: () => (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '13px', paddingRight: '20px' }}>
            <div style={label11}>Pending QC / Dispatch</div>
            <Link href="/production" style={{ fontSize: '11px', color: '#60A5FA' }}>View all →</Link>
          </div>
          {qcBatches.map(b => (
            <div key={b.bid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '9px 0', borderTop: '1px solid #1C1C20' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: '#8A9099' }}>{b.bid}</div>
                <div style={{ fontSize: '12px', color: '#E2E8ED', marginTop: '2px' }}>{b.ref} · {b.product}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', color: '#C8D0D8' }}>{fmtG(b.wt)}</div>
                <StatusChip status={b.stage === 'qc' ? 'qc' : b.stage === 'dispatch' ? 'dispatched' : 'production'} />
              </div>
            </div>
          ))}
        </div>
      ),
    },
    'fin-todays-collections': {
      spanClass: 'ss-span-standard',
      render: () => (
        <div style={cardStyle}>
          <div style={{ ...label11, marginBottom: '14px' }}>Today's Collections</div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '26px', fontWeight: 600, color: '#F0F2F4', fontVariantNumeric: 'tabular-nums' }}>₹ 2,39,400</div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '14px' }}>
            <div><div style={{ fontSize: '11px', color: '#8A9099' }}>Silver in</div><div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '14px', color: '#4ADE80', marginTop: '3px' }}>575.000 g</div></div>
            <div><div style={{ fontSize: '11px', color: '#8A9099' }}>Txns</div><div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '14px', color: '#C8D0D8', marginTop: '3px' }}>8</div></div>
          </div>
        </div>
      ),
    },
    'fin-profit-this-month': {
      spanClass: 'ss-span-standard',
      render: () => (
        <div style={cardStyle}>
          <div style={{ ...label11, marginBottom: '14px' }}>Profit · This Month</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '26px', fontWeight: 600, color: '#4ADE80', fontVariantNumeric: 'tabular-nums' }}>23.0%</div>
            <div style={{ fontSize: '12px', color: '#8A9099' }}>margin</div>
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '14px' }}>
            <div><div style={{ fontSize: '11px', color: '#8A9099' }}>Revenue</div><div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '14px', color: '#C8D0D8', marginTop: '3px' }}>₹ 24.80 L</div></div>
            <div><div style={{ fontSize: '11px', color: '#8A9099' }}>Cost</div><div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '14px', color: '#8A9099', marginTop: '3px' }}>₹ 19.10 L</div></div>
          </div>
        </div>
      ),
    },
    'fin-silver-movement-30d': {
      spanClass: 'ss-span-standard',
      render: () => (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', paddingRight: '20px' }}>
            <div style={label11}>Silver Movement · 30d</div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#8A9099' }}><span style={{ width: '8px', height: '2px', background: '#C8D0D8', display: 'inline-block' }} />In</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#8A9099' }}><span style={{ width: '8px', height: '2px', background: '#5a5a62', display: 'inline-block' }} />Out</span>
            </div>
          </div>
          <div style={{ height: '96px' }}>
            <MiniChart data={inData} color="#C8D0D8" height={96} secondData={outData} secondColor="#5a5a62" />
          </div>
        </div>
      ),
    },
    'intel-top-clients': {
      spanClass: 'ss-span-standard',
      render: () => (
        <div style={cardStyle}>
          <div style={{ ...label11, marginBottom: '6px' }}>Top Clients · This Month</div>
          {topClients.map(c => (
            <Link key={c.id} href="/clients" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '9px 0', borderTop: '1px solid #1C1C20', textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: '#5a5a62', width: '14px' }}>{c.rank}</span>
                <span style={{ fontSize: '13px', color: '#E2E8ED', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', color: '#C8D0D8' }}>{c.value}</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', color: '#8A9099' }}>{c.outStr} due</div>
              </div>
            </Link>
          ))}
        </div>
      ),
    },
    'intel-alert-centre': {
      spanClass: 'ss-span-standard',
      render: () => (
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', paddingRight: '20px' }}>
            <div style={label11}>Alert Centre</div>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', color: '#F87171', background: 'rgba(138,32,32,.18)', borderRadius: '4px', padding: '1px 6px' }}>7 active</span>
          </div>
          {alerts.map(al => (
            <div key={al.text} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', borderTop: '1px solid #1C1C20' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0, background: al.dot }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', color: '#C8D0D8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{al.text}</div>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', flexShrink: 0, color: al.dot }}>{al.metric}</span>
            </div>
          ))}
        </div>
      ),
    },
    'intel-recent-activity': {
      spanClass: 'ss-span-standard',
      render: () => (
        <div style={cardStyle}>
          <div style={{ ...label11, marginBottom: '6px' }}>Recent Activity</div>
          {activity.map(ev => (
            <div key={ev.text} style={{ display: 'flex', gap: '10px', padding: '9px 0', borderTop: '1px solid #1C1C20' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, marginTop: '5px', background: ev.dot }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', color: '#C8D0D8' }}>{ev.text}</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', color: '#5a5a62', marginTop: '2px' }}>{ev.time}</div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
  };

  return (
    <div className="ss-page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 600, color: '#F0F2F4', letterSpacing: '-.01em', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Command Center
              {isCustomized && (
                <span style={{ fontSize: '10px', fontWeight: 500, color: '#60A5FA', background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: '4px', padding: '2px 7px', fontFamily: "'JetBrains Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Custom Layout
                </span>
              )}
            </div>
            <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '3px', fontFamily: "'JetBrains Mono',monospace" }}>
              {todayStr} · Surat Unit · Live
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isCustomized && (
            <button
              onClick={handleResetLayout}
              title="Restore default layout arrangement"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                height: '32px',
                padding: '0 12px',
                border: '1px solid #33333a',
                borderRadius: '6px',
                color: '#60A5FA',
                fontWeight: 500,
                fontSize: '12px',
                cursor: 'pointer',
                background: 'rgba(96, 165, 250, 0.08)',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon name="reset" size={13} color="#60A5FA" />
              Reset Layout
            </button>
          )}
          <button style={{ display: 'flex', alignItems: 'center', gap: '7px', height: '32px', padding: '0 13px', border: '1px solid #242428', borderRadius: '6px', color: '#C8D0D8', fontWeight: 500, cursor: 'pointer', background: 'transparent' }}>
            Filter
          </button>
          <Link href="/reports" style={{ display: 'flex', alignItems: 'center', height: '32px', padding: '0 13px', border: '1px solid #242428', borderRadius: '6px', color: '#C8D0D8', fontWeight: 500, cursor: 'pointer' }}>
            Export Report
          </Link>
        </div>
      </div>

      {/* Single Continuous Fluid Responsive 60-Column Grid */}
      <div className="ss-fluid-grid">
        {cardOrder.map((id, idx) => {
          const cardObj = cardMap[id];
          if (!cardObj) return null;
          return (
            <DraggableDashboardCard
              key={id}
              id={id}
              index={idx}
              isDragging={activeDragId === id}
              isOver={dragOverId === id}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              className={cardObj.spanClass}
            >
              {cardObj.render()}
            </DraggableDashboardCard>
          );
        })}
      </div>
    </div>
  );
}
