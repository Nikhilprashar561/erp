'use client';
import React, { useState, useEffect } from 'react';
import { useMasterStore } from '@/stores/useMasterStore';
import { useUIStore } from '@/stores/useUIStore';
import AddCategoryModal from '@/components/master/AddCategoryModal';

const masterTabs = [
  { id: 'categories', label: 'Categories' },
  { id: 'purity', label: 'Purity Standards' },
  { id: 'making', label: 'Making Charges' },
  { id: 'jobtypes', label: 'Job Types' },
  { id: 'units', label: 'Units' },
];

export default function MasterPage() {
  const { activeTab, setActiveTab, categories, purity, making, jobtypes, units, isLoading, fetchMasterData } =
    useMasterStore();
  const showToast = useUIStore((s) => s.showToast);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

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
            Master Data
          </div>
          <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '3px' }}>
            System configuration · categories, purity, making charges &amp; more
          </div>
        </div>
        <button
          onClick={() => {
            if (activeTab === 'categories') {
              setIsAddCategoryOpen(true);
            } else {
              showToast(`Form for adding ${activeTab} opened`);
            }
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
          }}
        >
          + Add Entry
        </button>
      </div>

      {/* Tab switcher */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {masterTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              height: '28px',
              padding: '0 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 500,
              border: '1px solid',
              borderColor: activeTab === t.id ? '#33333a' : '#1C1C20',
              background: activeTab === t.id ? '#18181C' : 'transparent',
              color: activeTab === t.id ? '#E2E8ED' : '#8A9099',
              flexShrink: 0,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', overflow: 'hidden' }}>
        {activeTab === 'categories' && (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '550px', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr>
                  <th style={th}>Category Name</th>
                  <th style={th}>Code</th>
                  <th style={th}>Description</th>
                  <th style={{ ...th, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: '#8A9099' }}>
                      Loading master categories...
                    </td>
                  </tr>
                ) : (
                  categories.map((r, i) => (
                    <tr key={r.code} style={{ background: i % 2 === 0 ? '#111113' : '#0E0E10' }}>
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', color: '#E2E8ED' }}>
                        {r.name}
                      </td>
                      <td
                        style={{
                          padding: '11px 14px',
                          borderBottom: '1px solid #1C1C20',
                          fontFamily: "'JetBrains Mono',monospace",
                          color: '#8A9099',
                        }}
                      >
                        {r.code}
                      </td>
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', color: '#8A9099' }}>
                        {r.desc}
                      </td>
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', textAlign: 'right' }}>
                        <button
                          onClick={() => showToast(`Edit category ${r.name}`)}
                          style={{ fontSize: '11px', color: '#60A5FA', cursor: 'pointer', background: 'transparent', border: 'none' }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'purity' && (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '550px', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr>
                  <th style={th}>Standard</th>
                  <th style={th}>Code</th>
                  <th style={th}>Use Case</th>
                  <th style={{ ...th, textAlign: 'right' }}>Purity %</th>
                </tr>
              </thead>
              <tbody>
                {purity.map((r, i) => (
                  <tr key={r.code} style={{ background: i % 2 === 0 ? '#111113' : '#0E0E10' }}>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', color: '#E2E8ED' }}>
                      {r.std}
                    </td>
                    <td
                      style={{
                        padding: '11px 14px',
                        borderBottom: '1px solid #1C1C20',
                        fontFamily: "'JetBrains Mono',monospace",
                        color: '#8A9099',
                      }}
                    >
                      {r.code}
                    </td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', color: '#8A9099' }}>
                      {r.use}
                    </td>
                    <td
                      style={{
                        padding: '11px 14px',
                        borderBottom: '1px solid #1C1C20',
                        fontFamily: "'JetBrains Mono',monospace",
                        textAlign: 'right',
                        color: '#4ADE80',
                      }}
                    >
                      {r.pct ? `${r.pct}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'making' && (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '550px', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr>
                  <th style={th}>Category</th>
                  <th style={th}>Making Rate</th>
                  <th style={th}>Minimum</th>
                  <th style={th}>Wastage</th>
                  <th style={{ ...th, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {making.map((r, i) => (
                  <tr key={r.id || r.cat} style={{ background: i % 2 === 0 ? '#111113' : '#0E0E10' }}>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', color: '#E2E8ED' }}>
                      {r.cat}
                    </td>
                    <td
                      style={{
                        padding: '11px 14px',
                        borderBottom: '1px solid #1C1C20',
                        fontFamily: "'JetBrains Mono',monospace",
                        color: '#C8D0D8',
                      }}
                    >
                      {r.rate}
                    </td>
                    <td
                      style={{
                        padding: '11px 14px',
                        borderBottom: '1px solid #1C1C20',
                        fontFamily: "'JetBrains Mono',monospace",
                        color: '#8A9099',
                      }}
                    >
                      {r.min}
                    </td>
                    <td
                      style={{
                        padding: '11px 14px',
                        borderBottom: '1px solid #1C1C20',
                        fontFamily: "'JetBrains Mono',monospace",
                        color: '#8A9099',
                      }}
                    >
                      {r.wastage}
                    </td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', textAlign: 'right' }}>
                      <button
                        onClick={() => showToast(`Edit making charge for ${r.cat}`)}
                        style={{ fontSize: '11px', color: '#60A5FA', cursor: 'pointer', background: 'transparent', border: 'none' }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'jobtypes' && (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '550px', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr>
                  <th style={th}>Job Type</th>
                  <th style={th}>Description</th>
                  <th style={{ ...th, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {jobtypes.map((r, i) => (
                  <tr key={r.type} style={{ background: i % 2 === 0 ? '#111113' : '#0E0E10' }}>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', color: '#E2E8ED' }}>
                      {r.type}
                    </td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', color: '#8A9099' }}>
                      {r.desc}
                    </td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', textAlign: 'right' }}>
                      <button
                        onClick={() => showToast(`Edit job type ${r.type}`)}
                        style={{ fontSize: '11px', color: '#60A5FA', cursor: 'pointer', background: 'transparent', border: 'none' }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'units' && (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '550px', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr>
                  <th style={th}>Unit Name</th>
                  <th style={th}>Code</th>
                  <th style={th}>Basis</th>
                  <th style={{ ...th, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {units.map((r, i) => (
                  <tr key={r.code} style={{ background: i % 2 === 0 ? '#111113' : '#0E0E10' }}>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', color: '#E2E8ED' }}>
                      {r.name}
                    </td>
                    <td
                      style={{
                        padding: '11px 14px',
                        borderBottom: '1px solid #1C1C20',
                        fontFamily: "'JetBrains Mono',monospace",
                        color: '#8A9099',
                      }}
                    >
                      {r.code}
                    </td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', color: '#8A9099' }}>
                      {r.basis}
                    </td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid #1C1C20', textAlign: 'right' }}>
                      <button
                        onClick={() => showToast(`Edit unit ${r.name}`)}
                        style={{ fontSize: '11px', color: '#60A5FA', cursor: 'pointer', background: 'transparent', border: 'none' }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      <AddCategoryModal isOpen={isAddCategoryOpen} onClose={() => setIsAddCategoryOpen(false)} />
    </div>
  );
}
