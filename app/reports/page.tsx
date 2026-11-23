'use client';
import React, { useEffect } from 'react';
import { useReportsStore } from '@/stores/useReportsStore';
import { useUIStore } from '@/stores/useUIStore';

const catColor: Record<string, string> = {
  Silver: '#C8D0D8',
  Finance: '#4ADE80',
  Operations: '#60A5FA',
  People: '#C084FC',
};

export default function ReportsPage() {
  const { reports, isLoading, downloadingId, fetchReports, downloadReport } = useReportsStore();
  const showToast = useUIStore((s) => s.showToast);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleDownload = async (reportId: string, name: string) => {
    showToast(`Generating ${name}...`);
    const res = await downloadReport(reportId);
    if (res.success) {
      showToast(`${res.filename} downloaded successfully`);
    } else {
      showToast(res.error || 'Failed to generate report');
    }
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
            Reports &amp; Export Hub
          </div>
          <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '3px' }}>
            Generate &amp; export · silver position, GST register, karigar loss audit &amp; stock valuation
          </div>
        </div>
        <button
          onClick={() => showToast('Scheduled automated weekly reports configured')}
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '32px',
            padding: '0 14px',
            border: '1px solid #242428',
            borderRadius: '6px',
            color: '#C8D0D8',
            fontWeight: 500,
            cursor: 'pointer',
            background: 'transparent',
          }}
        >
          Schedule Report
        </button>
      </div>

      {isLoading && reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#8A9099' }}>Loading report hub...</div>
      ) : (
        <div className="ss-g3">
          {reports.map((r) => {
            const isDownloading = downloadingId === r.id;
            return (
              <div
                key={r.id || r.name}
                onClick={() => handleDownload(r.id, r.name)}
                style={{
                  background: '#111113',
                  border: '1px solid #242428',
                  borderRadius: '9px',
                  padding: '17px 18px',
                  cursor: isDownloading ? 'wait' : 'pointer',
                  transition: 'border-color .15s, background .15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#33333a';
                  e.currentTarget.style.background = '#141418';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#242428';
                  e.currentTarget.style.background = '#111113';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '.07em',
                      color: catColor[r.cat] || '#8A9099',
                    }}
                  >
                    {r.cat}
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '13px', color: '#F0F2F4' }}>
                    {r.stat}
                  </span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#E2E8ED' }}>{r.name}</div>
                <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '5px', lineHeight: 1.4, minHeight: '34px' }}>
                  {r.desc}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '14px',
                    fontSize: '11px',
                    color: isDownloading ? '#FFC840' : '#60A5FA',
                    fontWeight: 500,
                  }}
                >
                  {isDownloading ? 'Generating CSV...' : 'Generate & Export CSV'} <span>→</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
