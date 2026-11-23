'use client';
import React, { useState } from 'react';
import { useEmployeeStore } from '@/stores/useEmployeeStore';
import { useUIStore } from '@/stores/useUIStore';
import { CreateEmployeeSchema, type CreateEmployeeInput } from '@/lib/validations/employee.schema';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddEmployeeModal({ isOpen, onClose }: AddEmployeeModalProps) {
  const { createEmployee } = useEmployeeStore();
  const showToast = useUIStore((s) => s.showToast);

  const [name, setName] = useState('');
  const [role, setRole] = useState('Store Keeper');
  const [department, setDepartment] = useState('Warehouse');
  const [monthlySalary, setMonthlySalary] = useState(25000);
  const [joinedYear, setJoinedYear] = useState('2024');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload: CreateEmployeeInput = {
      name: name.trim(),
      role: role.trim(),
      department: department.trim(),
      monthlySalary: Number(monthlySalary),
      joinedYear: joinedYear.trim(),
    };

    const validated = CreateEmployeeSchema.safeParse(payload);
    if (!validated.success) {
      const fieldErrors: Record<string, string> = {};
      for (const err of validated.error.issues) {
        if (err.path && err.path[0]) {
          fieldErrors[String(err.path[0])] = err.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const res = await createEmployee(payload);
    setIsSubmitting(false);

    if (res.success) {
      showToast(`Employee ${payload.name} onboarded successfully`);
      onClose();
    } else {
      showToast(res.error || 'Failed to onboard employee');
    }
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 500,
    color: '#8A9099',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '.05em',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '34px',
    background: '#18181C',
    border: '1px solid #242428',
    borderRadius: '6px',
    padding: '0 10px',
    color: '#F0F2F4',
    fontSize: '13px',
    outline: 'none',
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,.6)' }} />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: '460px',
          background: '#111113',
          border: '1px solid #242428',
          borderRadius: '10px',
          zIndex: 110,
          boxShadow: '0 20px 40px rgba(0,0,0,.6)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #1C1C20',
          }}
        >
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#F0F2F4' }}>Add Employee</div>
            <div style={{ fontSize: '11px', color: '#8A9099', marginTop: '2px' }}>
              Onboard factory or administrative staff
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#8A9099', cursor: 'pointer', fontSize: '18px' }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Prajapati"
              style={inputStyle}
            />
            {errors.name && <div style={{ color: '#F87171', fontSize: '11px', marginTop: '4px' }}>{errors.name}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Role / Designation</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Quality Inspector"
                style={inputStyle}
              />
              {errors.role && <div style={{ color: '#F87171', fontSize: '11px', marginTop: '4px' }}>{errors.role}</div>}
            </div>
            <div>
              <label style={labelStyle}>Department</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} style={inputStyle}>
                <option value="Production">Production</option>
                <option value="Warehouse">Warehouse</option>
                <option value="Finance">Finance</option>
                <option value="Management">Management</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
            <div>
              <label style={labelStyle}>Monthly Salary (₹)</label>
              <input
                type="number"
                value={monthlySalary}
                onChange={(e) => setMonthlySalary(parseFloat(e.target.value) || 0)}
                style={inputStyle}
              />
              {errors.monthlySalary && (
                <div style={{ color: '#F87171', fontSize: '11px', marginTop: '4px' }}>{errors.monthlySalary}</div>
              )}
            </div>
            <div>
              <label style={labelStyle}>Joined Year</label>
              <input
                type="text"
                value={joinedYear}
                onChange={(e) => setJoinedYear(e.target.value)}
                maxLength={4}
                placeholder="2024"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                height: '34px',
                padding: '0 14px',
                background: 'transparent',
                border: '1px solid #242428',
                borderRadius: '6px',
                color: '#8A9099',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                height: '34px',
                padding: '0 18px',
                background: '#C8D0D8',
                color: '#0A0A0B',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {isSubmitting ? 'Saving...' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
