'use client';
import React, { useEffect } from 'react';
import { useWhereSilverStore, type WhereSilverFilter } from '@/stores/useWhereSilverStore';
import { useUIStore } from '@/stores/useUIStore';
import { fmtGn, statusMeta } from '@/lib/formatters';

export default function WhereSilverPage() {
  const { locations, filter, setFilter, fetchLocations, reconcileStock, isLoading, isReconciling } =
    useWhereSilverStore();
  const showToast = useUIStore((s) => s.showToast);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const filtered =
    filter === 'All'
      ? locations
      : locations.filter((l) => l.type.includes(filter === 'Job Worker' ? 'Job' : filter));

  const tFac = locations.filter((l) => l.type === 'Factory').reduce((a, l) => a + l.amt, 0);
  const tKar = locations.filter((l) => l.type === 'Karigar').reduce((a, l) => a + l.amt, 0);
  const tJob = locations.filter((l) => l.type === 'Job Worker').reduce((a, l) => a + l.amt, 0);
  const tDis = locations.filter((l) => l.type.includes('Client') || l.type.includes('Dispatched')).reduce((a, l) => a + l.amt, 0);
  const totalInSystem = tFac + tKar + tJob + tDis;

  const cards = [
    { label: 'Total Silver in System', amt: fmtGn(totalInSystem), accent: '#F0F2F4' },
    { label: 'In Factory Stock', amt: fmtGn(tFac), accent: '#C8D0D8' },
    { label: 'With Karigars', amt: fmtGn(tKar), accent: '#C8D0D8' },
    { label: 'At Job Workers', amt: fmtGn(tJob), accent: '#C8D0D8' },
    { label: 'Dispatched · Unbilled', amt: fmtGn(tDis), accent: tDis > 0 ? '#FFC840' : '#C8D0D8' },
  ];

  const handleReconcile = async () => {
    const res = await reconcileStock();
    if (res.success) {
      showToast('Enterprise silver reconciliation completed across all locations');
    } else {
      showToast(res.error || 'Failed to reconcile stock');
    }
  };

  const locColor = (a: number) => (a >= 30 ? '#F87171' : a >= 15 ? '#FFC840' : '#C8D0D8');
  const th = {
    textAlign: 'left' as const,
    padding: '10px 16px',
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '.07em',
    color: '#8A9099',
    borderBottom: '1px solid #242428',
  };
  const filters: WhereSilverFilter[] = ['All', 'Factory', 'Karigar', 'Job Worker'];

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '22px', fontWeight: 600, color: '#F0F2F4', letterSpacing: '-.01em' }}>
              Where Is My Silver?
            </div>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '.08em',
                color: '#C8D0D8',
                border: '1px solid #33333a',
                borderRadius: '4px',
                padding: '2px 7px',
              }}
            >
              LIVE TRACE
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '4px' }}>
            {isLoading && locations.length === 0
              ? 'Loading enterprise location audit...'
              : 'Every gram of silver in the system, by physical location · aging tracked'}
          </div>
        </div>
        <button
          onClick={handleReconcile}
          disabled={isReconciling}
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
          {isReconciling ? 'Reconciling...' : 'Reconcile Stock'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="ss-g5">
        {cards.map((c) => (
          <div
            key={c.label}
            style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '15px 16px' }}
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
                marginTop: '14px',
                fontFamily: "'JetBrains Mono',monospace",
                fontVariantNumeric: 'tabular-nums',
                fontSize: '23px',
                fontWeight: 600,
                letterSpacing: '-.02em',
                color: c.accent,
              }}
            >
              {c.amt} g
            </div>
          </div>
        ))}
      </div>

      {/* Location Table */}
      <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', overflow: 'hidden' }}>
        <div
          style={{
            padding: '14px 17px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1C1C20',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '.08em',
              color: '#8A9099',
            }}
          >
            Location Breakdown ({filtered.length})
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  fontSize: '11px',
                  color: filter === f ? '#E2E8ED' : '#8A9099',
                  border: '1px solid',
                  borderColor: filter === f ? '#33333a' : '#1C1C20',
                  background: filter === f ? '#18181C' : 'transparent',
                  borderRadius: '5px',
                  padding: '4px 9px',
                  cursor: 'pointer',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#18181C' }}>
                <th style={th}>Location Type</th>
                <th style={th}>Party / Safe</th>
                <th style={{ ...th, textAlign: 'right' }}>Silver Held</th>
                <th style={th}>Since</th>
                <th style={{ ...th, textAlign: 'right' }}>Aging</th>
                <th style={th}>Status</th>
                <th style={{ ...th, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#8A9099' }}>
                    {isLoading ? 'Loading locations...' : 'No silver locations registered for this filter.'}
                  </td>
                </tr>
              ) : (
                filtered.map((l) => {
                  const statusKey =
                    l.aging >= 30 ? 'overdue' : l.aging >= 15 ? 'qc' : l.type === 'Factory' ? 'dispatched' : 'completed';
                  const statusLabel =
                    l.aging >= 30 ? 'Alert' : l.aging >= 15 ? 'Watch' : l.type === 'Factory' ? 'Secured' : 'Normal';
                  return (
                    <tr
                      key={l.id}
                      style={{ background: '#111113' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#1C1C22')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#111113')}
                    >
                      <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', color: '#C8D0D8' }}>
                        {l.type}
                      </td>
                      <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', color: '#E2E8ED' }}>
                        {l.party}
                      </td>
                      <td
                        style={{
                          padding: '11px 16px',
                          borderBottom: '1px solid #1C1C20',
                          fontFamily: "'JetBrains Mono',monospace",
                          fontVariantNumeric: 'tabular-nums',
                          textAlign: 'right',
                          color: '#F0F2F4',
                        }}
                      >
                        {fmtGn(l.amt)} g
                      </td>
                      <td
                        style={{
                          padding: '11px 16px',
                          borderBottom: '1px solid #1C1C20',
                          fontFamily: "'JetBrains Mono',monospace",
                          color: '#8A9099',
                        }}
                      >
                        {l.since}
                      </td>
                      <td
                        style={{
                          padding: '11px 16px',
                          borderBottom: '1px solid #1C1C20',
                          fontFamily: "'JetBrains Mono',monospace",
                          textAlign: 'right',
                          color: locColor(l.aging),
                        }}
                      >
                        {l.aging === 0 ? '—' : `${l.aging} days`}
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
                            background: statusMeta[statusKey]?.bg,
                            color: statusMeta[statusKey]?.fg,
                          }}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', textAlign: 'right' }}>
                        <button
                          onClick={() => showToast(`Tracing active silver movements for ${l.party}…`)}
                          style={{
                            fontSize: '11px',
                            color: '#60A5FA',
                            cursor: 'pointer',
                            background: 'transparent',
                            border: 'none',
                          }}
                        >
                          Trace →
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
    </div>
  );
}