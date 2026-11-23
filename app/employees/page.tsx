'use client';
import React, { useState, useEffect } from 'react';
import { useEmployeeStore } from '@/stores/useEmployeeStore';
import { useUIStore } from '@/stores/useUIStore';
import { fmtINRn } from '@/lib/formatters';
import AddEmployeeModal from '@/components/employees/AddEmployeeModal';

export default function EmployeesPage() {
  const { cards, employees, isLoading, fetchEmployees, toggleAttendance } = useEmployeeStore();
  const showToast = useUIStore((s) => s.showToast);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const th = {
    textAlign: 'left' as const,
    padding: '10px 16px',
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '.06em',
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
          marginBottom: '18px',
        }}
      >
        <div>
          <div style={{ fontSize: '22px', fontWeight: 600, color: '#F0F2F4', letterSpacing: '-.01em' }}>
            Employees
          </div>
          <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '3px' }}>
            Staff roster, daily attendance &amp; payroll
          </div>
        </div>
        <button
          onClick={() => setIsAddEmployeeOpen(true)}
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
          + Add Employee
        </button>
      </div>

      {/* KPI Cards */}
      <div className="ss-g4">
        {cards.map((c) => (
          <div
            key={c.label}
            style={{
              background: '#111113',
              border: '1px solid #242428',
              borderRadius: '8px',
              padding: '14px 16px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: '#8A9099' }}>
              {c.label}
            </div>
            <div style={{ marginTop: '13px', fontFamily: "'JetBrains Mono',monospace", fontSize: '22px', fontWeight: 600, color: c.accent }}>
              {c.amt}
            </div>
          </div>
        ))}
      </div>

      {/* Staff Roster Table */}
      <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#18181C' }}>
                <th style={th}>Employee</th>
                <th style={th}>Role</th>
                <th style={th}>Department</th>
                <th style={th}>Attendance</th>
                <th style={th}>Joined</th>
                <th style={{ ...th, textAlign: 'right' }}>Monthly Salary</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && employees.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#8A9099' }}>
                    Loading employee roster...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#8A9099' }}>
                    No staff records found. Click &quot;+ Add Employee&quot; to onboard staff.
                  </td>
                </tr>
              ) : (
                employees.map((e, i) => {
                  const attBg = e.att === 'present' ? 'rgba(45,125,82,.18)' : 'rgba(138,98,0,.2)';
                  const attFg = e.att === 'present' ? '#4ADE80' : '#FFC840';
                  const attLabel = e.att === 'present' ? 'Present' : 'On Leave';

                  return (
                    <tr key={e.id || e.name} style={{ background: i % 2 === 0 ? '#111113' : '#0E0E10' }}>
                      <td style={{ padding: '10px 16px', borderBottom: '1px solid #1C1C20' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '6px',
                              background: 'linear-gradient(135deg,#2a2a30,#18181C)',
                              border: '1px solid #33333a',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              fontWeight: 600,
                              color: '#E2E8ED',
                              flexShrink: 0,
                            }}
                          >
                            {e.init}
                          </span>
                          <span style={{ color: '#E2E8ED' }}>{e.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', color: '#C8D0D8' }}>
                        {e.role}
                      </td>
                      <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20', color: '#8A9099' }}>
                        {e.dept}
                      </td>
                      <td style={{ padding: '11px 16px', borderBottom: '1px solid #1C1C20' }}>
                        <button
                          onClick={async () => {
                            await toggleAttendance(e.id, e.att);
                            showToast(`Attendance updated for ${e.name}`);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            height: '22px',
                            padding: '0 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '.06em',
                            background: attBg,
                            color: attFg,
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          {attLabel} ⟳
                        </button>
                      </td>
                      <td
                        style={{
                          padding: '11px 16px',
                          borderBottom: '1px solid #1C1C20',
                          fontFamily: "'JetBrains Mono',monospace",
                          color: '#8A9099',
                        }}
                      >
                        {e.joined}
                      </td>
                      <td
                        style={{
                          padding: '11px 16px',
                          borderBottom: '1px solid #1C1C20',
                          fontFamily: "'JetBrains Mono',monospace",
                          textAlign: 'right',
                          color: '#C8D0D8',
                        }}
                      >
                        {e.salary ? fmtINRn(e.salary) : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      <AddEmployeeModal isOpen={isAddEmployeeOpen} onClose={() => setIsAddEmployeeOpen(false)} />
    </div>
  );
}
