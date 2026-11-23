'use client';
import React from 'react';
import { useApp } from '@/lib/store/AppContext';

const masterTabs = [
  { id: 'categories', label: 'Categories' }, { id: 'purity', label: 'Purity Standards' },
  { id: 'making', label: 'Making Charges' }, { id: 'jobtypes', label: 'Job Types' }, { id: 'units', label: 'Units' },
];

const masterData = {
  categories: [
    { name: 'Payal (Anklet)', code: 'PYL', desc: 'Foot ornament' }, { name: 'Kada (Bangle)', code: 'KAD', desc: 'Wrist ornament' },
    { name: 'Chain', code: 'CHN', desc: 'Neck & waist chain' }, { name: 'Bichiya (Toe Ring)', code: 'BCH', desc: 'Toe ornament' },
    { name: 'Pendant', code: 'PND', desc: 'Neck pendant' }, { name: 'Anklet', code: 'ANK', desc: 'Ankle ornament' },
  ],
  purity: [
    { std: '99.9% Fine', code: '999', use: 'Raw Silver, Bars' }, { std: '92.5% Sterling', code: '925', use: 'Most jewellery' },
    { std: '80% Standard', code: '800', use: 'Cutlery, utility' }, { std: '72.2% Coin', code: '722', use: 'Coin silver' },
  ],
  making: [
    { cat: 'Payal · Filigree', rate: '₹ 120 / g', min: '₹ 800', wastage: '2.5%' },
    { cat: 'Chain · Machine', rate: '₹ 40 / g', min: '₹ 400', wastage: '0.5%' },
    { cat: 'Kada · Casting', rate: '₹ 90 / g', min: '₹ 600', wastage: '1.8%' },
    { cat: 'Stone Setting', rate: '₹ 200 / pc', min: '₹ 1,000', wastage: '0.0%' },
  ],
  jobtypes: [
    { type: 'Casting', desc: 'Mould & cast silver' }, { type: 'Polishing', desc: 'Surface finish' },
    { type: 'Stone Setting', desc: 'Kundan & gem' }, { type: 'Plating', desc: 'Rhodium / gold dip' },
    { type: 'Engraving', desc: 'Laser / hand engrave' },
  ],
  units: [
    { name: 'Gram', code: 'g', basis: 'Weight' }, { name: 'Kilogram', code: 'kg', basis: 'Weight' },
    { name: 'Piece', code: 'pc', basis: 'Count' }, { name: 'Set', code: 'set', basis: 'Count' },
  ],
};

export default function MasterPage() {
  const { masterTab, setMasterTab, showToast } = useApp();
  const th = { textAlign: 'left' as const, padding: '9px 14px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '.07em', color: '#8A9099', borderBottom: '1px solid #242428', background: '#18181C' };

  return (
    <div className="ss-page">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 600, color: '#F0F2F4', letterSpacing: '-.01em' }}>Master Data</div>
          <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '3px' }}>System configuration · categories, purity, making charges & more</div>
        </div>
        <button onClick={() => showToast('New master entry form opened')} style={{ display: 'flex', alignItems: 'center', height: '32px', padding: '0 14px', background: '#C8D0D8', color: '#0A0A0B', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', border: 'none' }}>+ Add Entry</button>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {masterTabs.map(t => (
          <button key={t.id} onClick={() => setMasterTab(t.id)} style={{ display: 'flex', alignItems: 'center', height: '28px', padding: '0 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 500, border: '1px solid', borderColor: masterTab === t.id ? '#33333a' : '#1C1C20', background: masterTab === t.id ? '#18181C' : 'transparent', color: masterTab === t.id ? '#E2E8ED' : '#8A9099', flexShrink: 0 }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', overflow: 'hidden' }}>
        {masterTab === 'categories' && (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '550px', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead><tr><th style={th}>Category Name</th><th style={th}>Code</th><th style={th}>Description</th><th style={{ ...th, textAlign: 'right' }}>Action</th></tr></thead>
              <tbody>{masterData.categories.map((r, i) => (
                <tr key={r.code} style={{ background: i % 2 === 0 ? '#111113' : '#0E0E10' }}>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', color: '#E2E8ED' }}>{r.name}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", color: '#8A9099' }}>{r.code}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', color: '#8A9099' }}>{r.desc}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', textAlign: 'right' }}><button onClick={() => showToast('Edit form opened')} style={{ fontSize: '11px', color: '#60A5FA', cursor: 'pointer', background: 'transparent', border: 'none' }}>Edit</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
        {masterTab === 'purity' && (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '550px', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead><tr><th style={th}>Standard</th><th style={th}>Code</th><th style={th}>Use Case</th><th style={{ ...th, textAlign: 'right' }}>Action</th></tr></thead>
              <tbody>{masterData.purity.map((r, i) => (
                <tr key={r.code} style={{ background: i % 2 === 0 ? '#111113' : '#0E0E10' }}>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', color: '#E2E8ED' }}>{r.std}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", color: '#8A9099' }}>{r.code}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', color: '#8A9099' }}>{r.use}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', textAlign: 'right' }}><button onClick={() => showToast('Edit form opened')} style={{ fontSize: '11px', color: '#60A5FA', cursor: 'pointer', background: 'transparent', border: 'none' }}>Edit</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
        {masterTab === 'making' && (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '550px', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead><tr><th style={th}>Category</th><th style={th}>Making Rate</th><th style={th}>Minimum</th><th style={th}>Wastage</th><th style={{ ...th, textAlign: 'right' }}>Action</th></tr></thead>
              <tbody>{masterData.making.map((r, i) => (
                <tr key={r.cat} style={{ background: i % 2 === 0 ? '#111113' : '#0E0E10' }}>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', color: '#E2E8ED' }}>{r.cat}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", color: '#C8D0D8' }}>{r.rate}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", color: '#8A9099' }}>{r.min}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", color: '#8A9099' }}>{r.wastage}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', textAlign: 'right' }}><button onClick={() => showToast('Edit form opened')} style={{ fontSize: '11px', color: '#60A5FA', cursor: 'pointer', background: 'transparent', border: 'none' }}>Edit</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
        {masterTab === 'jobtypes' && (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '550px', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead><tr><th style={th}>Job Type</th><th style={th}>Description</th><th style={{ ...th, textAlign: 'right' }}>Action</th></tr></thead>
              <tbody>{masterData.jobtypes.map((r, i) => (
                <tr key={r.type} style={{ background: i % 2 === 0 ? '#111113' : '#0E0E10' }}>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', color: '#E2E8ED' }}>{r.type}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', color: '#8A9099' }}>{r.desc}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', textAlign: 'right' }}><button onClick={() => showToast('Edit form opened')} style={{ fontSize: '11px', color: '#60A5FA', cursor: 'pointer', background: 'transparent', border: 'none' }}>Edit</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
        {masterTab === 'units' && (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '550px', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead><tr><th style={th}>Unit Name</th><th style={th}>Code</th><th style={th}>Basis</th><th style={{ ...th, textAlign: 'right' }}>Action</th></tr></thead>
              <tbody>{masterData.units.map((r, i) => (
                <tr key={r.code} style={{ background: i % 2 === 0 ? '#111113' : '#0E0E10' }}>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', color: '#E2E8ED' }}>{r.name}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', fontFamily: "'JetBrains Mono',monospace", color: '#8A9099' }}>{r.code}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', color: '#8A9099' }}>{r.basis}</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', textAlign: 'right' }}><button onClick={() => showToast('Edit form opened')} style={{ fontSize: '11px', color: '#60A5FA', cursor: 'pointer', background: 'transparent', border: 'none' }}>Edit</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
