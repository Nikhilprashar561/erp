'use client';
import React, { useEffect } from 'react';
import { useAnalyticsStore } from '@/stores/useAnalyticsStore';
import MiniChart from '@/components/ui/MiniChart';

export default function AnalyticsPage() {
  const { period, data, isLoading, setPeriod, fetchAnalytics } = useAnalyticsStore();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const toggle = (v: 'Year' | 'Quarter') =>
    ({
      display: 'flex',
      alignItems: 'center',
      height: '28px',
      padding: '0 12px',
      borderRadius: '5px',
      fontSize: '12px',
      fontWeight: 500,
      color: period === v ? '#0A0A0B' : '#8A9099',
      background: period === v ? '#C8D0D8' : 'transparent',
      cursor: 'pointer',
      border: 'none',
    } as React.CSSProperties);

  const kpis = data?.kpis || [
    { label: 'Revenue · YTD', val: '₹ 2.42 Cr', delta: '+18.4%', dColor: '#4ADE80' },
    { label: 'Margin · YTD', val: '23.4%', delta: '+2.1pp', dColor: '#4ADE80' },
    { label: 'Silver Processed', val: '24,500 g', delta: '+12.6%', dColor: '#4ADE80' },
    { label: 'Avg Order Value', val: '₹ 2.18 L', delta: '+7.2%', dColor: '#4ADE80' },
  ];

  const months = data?.months || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueData = data?.revenueData || [18, 22, 25, 21, 28, 24, 29, 31, 27, 33, 35, 38];
  const costData = data?.costData || [14, 17, 19, 16, 22, 19, 22, 24, 21, 25, 27, 29];
  const silverIn = data?.silverIn || [3200, 3600, 3900, 3400, 4200, 4000, 4500, 4800, 4300, 5100, 5400, 5800];
  const silverOut = data?.silverOut || [3050, 3450, 3750, 3250, 4050, 3850, 4300, 4650, 4150, 4900, 5200, 5600];
  const marginData = data?.marginData || [22, 21, 23, 22, 23, 22, 21, 22, 22, 22, 22, 22];
  const prodLabels = data?.prodLabels || ['Payal (Anklet)', 'Chain', 'Kada', 'Bangle', 'Toe Ring (Bichiya)', 'Pendant'];
  const prodBarData = data?.prodBarData || [450, 310, 280, 190, 160, 120];

  const maxBar = Math.max(...prodBarData, 1);
  const totalBar = prodBarData.reduce((a, b) => a + b, 0) || 1;

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
          <div style={{ fontSize: '22px', fontWeight: 600, color: '#F0F2F4', letterSpacing: '-.01em' }}>
            Analytics
          </div>
          <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '3px' }}>
            Revenue trends, silver flow, gross margins &amp; product category mix
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            background: '#111113',
            border: '1px solid #242428',
            borderRadius: '7px',
            padding: '3px',
          }}
        >
          <button onClick={() => setPeriod('Year')} style={toggle('Year')}>
            Year
          </button>
          <button onClick={() => setPeriod('Quarter')} style={toggle('Quarter')}>
            Quarter
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="ss-g4">
        {kpis.map((k) => (
          <div
            key={k.label}
            style={{
              background: '#111113',
              border: '1px solid #242428',
              borderRadius: '8px',
              padding: '14px 16px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: '#8A9099' }}>
              {k.label}
            </div>
            <div style={{ marginTop: '11px', fontFamily: "'JetBrains Mono',monospace", fontSize: '24px', fontWeight: 600, color: '#F0F2F4' }}>
              {k.val}
            </div>
            <div style={{ marginTop: '5px', fontSize: '11px', color: k.dColor }}>
              {k.delta} vs prior period
            </div>
          </div>
        ))}
      </div>

      <div className="ss-an-top">
        {/* Revenue trend */}
        <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '16px 17px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#E2E8ED' }}>Revenue vs Cost Trend</div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[
                { lbl: 'Revenue', c: '#C8D0D8' },
                { lbl: 'Cost', c: '#5a5a62' },
              ].map((l) => (
                <span key={l.lbl} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#8A9099' }}>
                  <span style={{ width: '8px', height: '2px', background: l.c, display: 'inline-block' }} />
                  {l.lbl}
                </span>
              ))}
            </div>
          </div>
          <div style={{ height: '110px' }}>
            <MiniChart data={revenueData} color="#C8D0D8" height={110} secondData={costData} secondColor="#5a5a62" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            {months.map((m) => (
              <span key={m} style={{ fontSize: '9px', color: '#5a5a62', fontFamily: "'JetBrains Mono',monospace" }}>
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Top products bar */}
        <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '16px 17px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#E2E8ED', marginBottom: '14px' }}>
            Top Products by Volume (g)
          </div>
          {prodLabels.map((p, i) => (
            <div key={p} style={{ marginBottom: '9px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: '#C8D0D8' }}>{p}</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: '#8A9099' }}>
                  {prodBarData[i] || 0} g
                </span>
              </div>
              <div style={{ height: '6px', background: '#18181C', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    background: '#C8D0D8',
                    borderRadius: '3px',
                    width: `${((prodBarData[i] || 0) / maxBar) * 100}%`,
                    opacity: 0.6 + i * -0.06,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ss-an-bot">
        {/* Silver Inflow */}
        <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '16px 17px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#E2E8ED', marginBottom: '12px' }}>
            Silver Inflow / Outflow (g)
          </div>
          <div style={{ height: '90px' }}>
            <MiniChart data={silverIn} color="#4ADE80" height={90} secondData={silverOut} secondColor="#F87171" />
          </div>
        </div>
        {/* Margin */}
        <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '16px 17px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#E2E8ED', marginBottom: '12px' }}>
            Gross Margin Trend %
          </div>
          <div style={{ height: '90px' }}>
            <MiniChart data={marginData} color="#C084FC" height={90} />
          </div>
        </div>
        {/* Product mix */}
        <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '16px 17px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#E2E8ED', marginBottom: '12px' }}>Product Mix</div>
          {prodLabels.map((p, i) => {
            const pct = Math.round(((prodBarData[i] || 0) / totalBar) * 100);
            return (
              <div
                key={p}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '5px',
                  fontSize: '12px',
                  color: '#8A9099',
                }}
              >
                <span>{p}</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", color: '#C8D0D8' }}>{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
