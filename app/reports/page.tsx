'use client';
import React from 'react';
import { useApp } from '@/lib/store/AppContext';
import { reports } from '@/lib/data';

const catColor: Record<string, string> = { Silver: '#C8D0D8', Finance: '#4ADE80', Operations: '#60A5FA', People: '#C084FC' };

export default function ReportsPage() {
  const { showToast } = useApp();

  return (
    <div className="ss-page">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 600, color: '#F0F2F4', letterSpacing: '-.01em' }}>Reports</div>
          <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '3px' }}>Generate & export · silver, finance, operations & people</div>
        </div>
        <button onClick={() => showToast('Schedule report dialog opened')} style={{ display: 'flex', alignItems: 'center', height: '32px', padding: '0 14px', border: '1px solid #242428', borderRadius: '6px', color: '#C8D0D8', fontWeight: 500, cursor: 'pointer', background: 'transparent' }}>Schedule Report</button>
      </div>
      <div className="ss-g3">
        {reports.map(r => (
          <div key={r.name} onClick={() => showToast('Generating ' + r.name + ' report…')} style={{ background: '#111113', border: '1px solid #242428', borderRadius: '9px', padding: '17px 18px', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#33333a'; e.currentTarget.style.background = '#141418'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#242428'; e.currentTarget.style.background = '#111113'; }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: catColor[r.cat] || '#8A9099' }}>{r.cat}</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '13px', color: '#F0F2F4' }}>{r.stat}</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#E2E8ED' }}>{r.name}</div>
            <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '5px', lineHeight: 1.4 }}>{r.desc}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px', fontSize: '11px', color: '#60A5FA' }}>Generate <span>→</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}
