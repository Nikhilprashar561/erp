'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store/AppContext';
import { useDashboardStore, DEFAULT_CARD_ORDER } from '@/stores/useDashboardStore';
import { fmtG, fmtGn, fmtINR } from '@/lib/formatters';
import MiniChart from '@/components/ui/MiniChart';
import StatusChip from '@/components/ui/StatusChip';
import Icon from '@/components/ui/Icon';
import DraggableDashboardCard from '@/components/dashboard/DraggableDashboardCard';

export default function Dashboard() {
  const { rate } = useApp();
  const { metrics, cardOrder, isLoading, fetchMetrics, setCardOrder, resetCardOrder } = useDashboardStore();

  const todayStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchMetrics();
    try {
      const saved = localStorage.getItem('silversuite_dashboard_layout_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter((id) => DEFAULT_CARD_ORDER.includes(id));
          const missing = DEFAULT_CARD_ORDER.filter((id) => !valid.includes(id));
          setCardOrder([...valid, ...missing]);
        }
      }
    } catch {
      // fallback
    }
  }, [fetchMetrics, setCardOrder]);

  const isCustomized = mounted && JSON.stringify(cardOrder) !== JSON.stringify(DEFAULT_CARD_ORDER);

  const handleDragStart = (id: string) => {
    setActiveDragId(id);
  };

  const handleDragOver = (id: string, e: React.DragEvent) => {
    if (!activeDragId || activeDragId === id) return;
    const fromIdx = cardOrder.indexOf(activeDragId);
    const toIdx = cardOrder.indexOf(id);
    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;

    const updated = [...cardOrder];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setCardOrder(updated);
    setDragOverId(id);
  };

  const handleDrop = (targetId: string) => {
    if (!activeDragId) return;
    try {
      localStorage.setItem('silversuite_dashboard_layout_v1', JSON.stringify(cardOrder));
    } catch {}
    setActiveDragId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    if (activeDragId) {
      try {
        localStorage.setItem('silversuite_dashboard_layout_v1', JSON.stringify(cardOrder));
      } catch {}
    }
    setActiveDragId(null);
    setDragOverId(null);
  };

  const handleResetLayout = () => {
    resetCardOrder();
  };

  // KPIs
  const kpiData = metrics?.kpi;
  const kpis = [
    {
      id: 'kpi-todays-orders',
      label: "Today's Orders",
      value: kpiData ? kpiData.todayOrdersCount.toString() : '18',
      unit: '',
      sub: `${metrics?.topClients.length || 6} clients`,
      delta: '+4',
      deltaColor: '#4ADE80',
    },
    {
      id: 'kpi-silver-issued',
      label: 'Silver Issued',
      value: kpiData ? fmtGn(kpiData.totalSilverIssued) : '2,340.000',
      unit: 'g',
      sub: 'in circulation',
      delta: '',
      deltaColor: '#8A9099',
    },
    {
      id: 'kpi-silver-received',
      label: 'Silver Received',
      value: kpiData ? fmtGn(kpiData.totalSilverReceived) : '1,890.500',
      unit: 'g',
      sub: 'received/returned',
      delta: '',
      deltaColor: '#8A9099',
    },
    {
      id: 'kpi-outstanding-silver',
      label: 'Outstanding Silver',
      value: kpiData ? fmtGn(kpiData.totalSilverOutstanding) : '1,150.500',
      unit: 'g',
      sub: 'client balances',
      delta: '▲ 6%',
      deltaColor: '#FFC840',
    },
    {
      id: 'kpi-outstanding-inr',
      label: 'Outstanding INR',
      value: kpiData
        ? kpiData.totalInrOutstanding >= 100000
          ? `₹ ${(kpiData.totalInrOutstanding / 100000).toFixed(2)} L`
          : `₹ ${kpiData.totalInrOutstanding.toLocaleString('en-IN')}`
        : '₹ 38.42 L',
      unit: '',
      sub: 'receivables',
      delta: '▼ 3%',
      deltaColor: '#4ADE80',
    },
  ];

  const inData = metrics?.chart.inData || [55, 62, 58, 70, 75, 80, 85, 78, 82, 88, 92, 95];
  const outData = metrics?.chart.outData || [40, 45, 42, 50, 52, 55, 60, 58, 62, 65, 68, 70];

  const prodOrders = [
    { no: 'ORD-2241', client: 'Mehta Jewels', due: '18 Jun', status: 'production', prog: 60 },
    { no: 'ORD-2240', client: 'Kalyan Silver House', due: '19 Jun', status: 'qc', prog: 85 },
    { no: 'ORD-2239', client: 'Rajwadi Silver Arts', due: '20 Jun', status: 'production', prog: 40 },
    { no: 'ORD-2238', client: 'Shree Ganesh Orn.', due: '16 Jun', status: 'overdue', prog: 90 },
  ];

  const pendingJobs = [
    { worker: 'Deepak Casting Unit', ref: 'JOB-901', outStr: '300.000 g', due: '15 Jun', status: 'overdue' },
    { worker: 'Imran Stone Setting', ref: 'JOB-905', outStr: '50.000 g', due: '11 Jun', status: 'overdue' },
    { worker: 'Suresh Polishing', ref: 'JOB-907', outStr: '120.000 g', due: '18 Jun', status: 'production' },
    { worker: 'Bharat Plating Co.', ref: 'JOB-906', outStr: '56.000 g', due: '18 Jun', status: 'production' },
  ];

  const qcBatches = [
    { bid: 'BAT-401', ref: 'ORD-2240', product: 'Payal (Anklet)', wt: 820.5, stage: 'qc' },
    { bid: 'BAT-402', ref: 'ORD-2238', product: 'Bichiya', wt: 420.0, stage: 'dispatch' },
    { bid: 'BAT-403', ref: 'ORD-2241', product: 'Silver Kada', wt: 650.0, stage: 'polishing' },
  ];

  const topClients = (metrics?.topClients || []).map((c, i) => ({
    rank: i + 1,
    name: c.name,
    value:
      c.inrOutstanding >= 100000
        ? `₹ ${(c.inrOutstanding / 100000).toFixed(2)} L`
        : `₹ ${c.inrOutstanding.toLocaleString('en-IN')}`,
    outStr: c.silverOutstanding > 0 ? `${fmtGn(c.silverOutstanding)} g` : '0 g',
    id: c.id,
  }));

  const alerts = metrics?.alerts && metrics.alerts.length > 0
    ? metrics.alerts.map((al) => ({
        text: al.desc,
        metric: al.type === 'danger' ? 'Overdue' : 'Alert',
        dot: al.type === 'danger' ? '#F87171' : '#FFC840',
      }))
    : [
        { text: 'Shree Ganesh — payment overdue 6d', metric: '₹5.12L', dot: '#F87171' },
        { text: 'Imran Stone Setting — jobs overdue', metric: '88g', dot: '#F87171' },
        { text: 'Bharat Plating — silver aging 31d', metric: '40g', dot: '#FFC840' },
        { text: 'Main Vault — rod stock below safety level', metric: 'Low', dot: '#FFC840' },
      ];

  const activity = metrics?.activities && metrics.activities.length > 0
    ? metrics.activities.map((ev) => ({
        text: ev.message,
        time: ev.timeDisplay,
        dot: ev.tagColor || '#4ADE80',
      }))
    : [
        { text: 'Silver received · Mehta Jewels · 450.000 g', time: '12:18 PM', dot: '#4ADE80' },
        { text: 'Invoice INV-1190 generated · ₹1,35,153', time: '11:02 AM', dot: '#60A5FA' },
        { text: 'BATCH-401 moved to QC', time: '10:40 AM', dot: '#C8D0D8' },
        { text: 'Payment received · Kalyan · ₹1,50,000', time: '09:30 AM', dot: '#4ADE80' },
      ];

  const cardStyle = {
    background: '#111113',
    border: '1px solid #242428',
    borderRadius: '8px',
    padding: '15px 17px',
    height: '100%',
  };
  const label11 = {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '.08em',
    color: '#8A9099',
  };

  const cardMap: Record<string, { spanClass: string; render: () => React.ReactNode }> = {
    'kpi-todays-orders': {
      spanClass: 'ss-span-kpi',
      render: () => {
        const k = kpis[0];
        return (
          <div style={{ ...cardStyle, padding: '14px 16px' }}>
            <div style={label11}>{k.label}</div>
            <div style={{ marginTop: '13px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span
                style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontVariantNumeric: 'tabular-nums',
                  fontSize: '27px',
                  fontWeight: 600,
                  color: '#F0F2F4',
                  letterSpacing: '-.02em',
                }}
              >
                {k.value}
              </span>
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
              <span
                style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontVariantNumeric: 'tabular-nums',
                  fontSize: '27px',
                  fontWeight: 600,
                  color: '#F0F2F4',
                  letterSpacing: '-.02em',
                }}
              >
                {k.value}
              </span>
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
              <span
                style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontVariantNumeric: 'tabular-nums',
                  fontSize: '27px',
                  fontWeight: 600,
                  color: '#F0F2F4',
                  letterSpacing: '-.02em',
                }}
              >
                {k.value}
              </span>
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
              <span
                style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontVariantNumeric: 'tabular-nums',
                  fontSize: '27px',
                  fontWeight: 600,
                  color: '#F0F2F4',
                  letterSpacing: '-.02em',
                }}
              >
                {k.value}
              </span>
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
              <span
                style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontVariantNumeric: 'tabular-nums',
                  fontSize: '27px',
                  fontWeight: 600,
                  color: '#F0F2F4',
                  letterSpacing: '-.02em',
                }}
              >
                {k.value}
              </span>
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
            <Link href="/orders" style={{ fontSize: '11px', color: '#60A5FA' }}>
              View all →
            </Link>
          </div>
          {prodOrders.map((o) => (
            <Link key={o.no} href={`/orders/${o.no}`} style={{ display: 'block', padding: '9px 0', borderTop: '1px solid #1C1C20', textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: '#8A9099' }}>{o.no}</span>
                  <span style={{ fontSize: '13px', color: '#E2E8ED', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {o.client}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: '#8A9099' }}>due {o.due}</span>
                  <StatusChip status={o.status} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '7px' }}>
                <div style={{ flex: 1, height: '4px', background: '#18181C', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#C8D0D8', borderRadius: '3px', width: `${o.prog}%` }} />
                </div>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', color: '#8A9099', width: '30px', textAlign: 'right' }}>
                  {o.prog}%
                </span>
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
            <Link href="/outsourcing" style={{ fontSize: '11px', color: '#60A5FA' }}>
              View all →
            </Link>
          </div>
          {pendingJobs.map((j) => (
            <div key={j.ref} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '9px 0', borderTop: '1px solid #1C1C20' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '13px', color: '#E2E8ED', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {j.worker}
                </div>
                <div style={{ fontSize: '11px', color: '#8A9099', fontFamily: "'JetBrains Mono',monospace", marginTop: '2px' }}>
                  {j.ref} · out {j.outStr}
                </div>
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
            <Link href="/production" style={{ fontSize: '11px', color: '#60A5FA' }}>
              View all →
            </Link>
          </div>
          {qcBatches.map((b) => (
            <div key={b.bid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '9px 0', borderTop: '1px solid #1C1C20' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: '#8A9099' }}>{b.bid}</div>
                <div style={{ fontSize: '12px', color: '#E2E8ED', marginTop: '2px' }}>
                  {b.ref} · {b.product}
                </div>
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
          <div style={{ ...label11, marginBottom: '14px' }}>Collections Realized</div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '26px', fontWeight: 600, color: '#F0F2F4', fontVariantNumeric: 'tabular-nums' }}>
            {kpiData ? `₹ ${(kpiData.todaysCollections || 239400).toLocaleString('en-IN')}` : '₹ 2,39,400'}
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '14px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#8A9099' }}>Silver in</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '14px', color: '#4ADE80', marginTop: '3px' }}>
                {kpiData ? `${fmtGn(kpiData.totalSilverReceived || 575)} g` : '575.000 g'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#8A9099' }}>Active Batches</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '14px', color: '#C8D0D8', marginTop: '3px' }}>
                {kpiData ? kpiData.ordersInProduction : 8}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    'fin-profit-this-month': {
      spanClass: 'ss-span-standard',
      render: () => (
        <div style={cardStyle}>
          <div style={{ ...label11, marginBottom: '14px' }}>Profit Margin · This Month</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '26px', fontWeight: 600, color: '#4ADE80', fontVariantNumeric: 'tabular-nums' }}>
              23.4%
            </div>
            <div style={{ fontSize: '12px', color: '#8A9099' }}>margin</div>
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '14px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#8A9099' }}>Gross Billed</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '14px', color: '#C8D0D8', marginTop: '3px' }}>
                ₹ 24.80 L
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#8A9099' }}>Operational Cost</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '14px', color: '#8A9099', marginTop: '3px' }}>
                ₹ 19.10 L
              </div>
            </div>
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
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#8A9099' }}>
                <span style={{ width: '8px', height: '2px', background: '#C8D0D8', display: 'inline-block' }} />
                In
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#8A9099' }}>
                <span style={{ width: '8px', height: '2px', background: '#5a5a62', display: 'inline-block' }} />
                Out
              </span>
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
          <div style={{ ...label11, marginBottom: '6px' }}>Top Clients · Active Outstandings</div>
          {topClients.map((c) => (
            <Link key={c.id} href="/clients" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '9px 0', borderTop: '1px solid #1C1C20', textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: '#5a5a62', width: '14px' }}>
                  {c.rank}
                </span>
                <span style={{ fontSize: '13px', color: '#E2E8ED', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.name}
                </span>
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
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', color: '#F87171', background: 'rgba(138,32,32,.18)', borderRadius: '4px', padding: '1px 6px' }}>
              {alerts.length} active
            </span>
          </div>
          {alerts.map((al, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', borderTop: '1px solid #1C1C20' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0, background: al.dot }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', color: '#C8D0D8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {al.text}
                </div>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', flexShrink: 0, color: al.dot }}>
                {al.metric}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    'intel-recent-activity': {
      spanClass: 'ss-span-standard',
      render: () => (
        <div style={cardStyle}>
          <div style={{ ...label11, marginBottom: '6px' }}>Recent Activity Feed</div>
          {activity.map((ev, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', padding: '9px 0', borderTop: '1px solid #1C1C20' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, marginTop: '5px', background: ev.dot }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', color: '#C8D0D8' }}>{ev.text}</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', color: '#5a5a62', marginTop: '2px' }}>
                  {ev.time}
                </div>
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
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 500,
                    color: '#60A5FA',
                    background: 'rgba(96,165,250,0.12)',
                    border: '1px solid rgba(96,165,250,0.3)',
                    borderRadius: '4px',
                    padding: '2px 7px',
                    fontFamily: "'JetBrains Mono',monospace",
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Custom Layout
                </span>
              )}
            </div>
            <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '3px', fontFamily: "'JetBrains Mono',monospace" }}>
              {todayStr} · Surat Unit · Live (MCX: ₹ {rate ? rate.toLocaleString('en-IN') : '88,900'})
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
          <Link
            href="/orders"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              height: '32px',
              padding: '0 13px',
              background: '#C8D0D8',
              color: '#0A0A0B',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'none',
              fontSize: '13px',
            }}
          >
            + New Order
          </Link>
          <Link
            href="/reports"
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
              textDecoration: 'none',
              fontSize: '13px',
            }}
          >
            Export Report
          </Link>
        </div>
      </div>

      {/* Responsive Fluid Grid */}
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
