'use client';
import React, { useState } from 'react';
import { useKarigarStore } from '@/stores/useKarigarStore';
import { useUIStore } from '@/stores/useUIStore';
import { AssignWorkSchema, type AssignWorkInput } from '@/lib/validations/karigar.schema';

interface AssignWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultKarigarId?: string;
}

export default function AssignWorkModal({ isOpen, onClose, defaultKarigarId }: AssignWorkModalProps) {
  const { karigars, assignWork, isSubmitting } = useKarigarStore();
  const showToast = useUIStore((s) => s.showToast);

  const [formData, setFormData] = useState<AssignWorkInput>({
    karigarId: defaultKarigarId || karigars[0]?.id || '',
    product: '',
    orderRef: 'ORD-2241',
    weightIssued: 50.000,
    expectedFine: 48.500,
    dueDate: '20 Jun',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validated = AssignWorkSchema.safeParse(formData);
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

    const res = await assignWork(validated.data);
    if (res.success) {
      showToast('Work assigned to artisan successfully!');
      onClose();
    } else {
      setErrors({ global: res.error || 'Failed to assign work' });
    }
  };

  const inputStyle = {
    width: '100%',
    height: '36px',
    background: '#141418',
    border: '1px solid #242428',
    borderRadius: '6px',
    padding: '0 12px',
    color: '#F0F2F4',
    fontSize: '13px',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '.07em',
    color: '#8A9099',
    marginBottom: '6px',
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 100, backdropFilter: 'blur(2px)' }} />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: '480px',
          background: '#111113',
          border: '1px solid #242428',
          borderRadius: '10px',
          zIndex: 101,
          boxShadow: '0 20px 48px rgba(0,0,0,0.6)',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 600, color: '#F0F2F4' }}>Assign Silver Work</div>
            <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '2px' }}>Issue raw metal to artisan and record piece</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#8A9099', cursor: 'pointer', fontSize: '20px' }}>
            ×
          </button>
        </div>

        {errors.global && (
          <div style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid #F87171', borderRadius: '6px', padding: '10px', color: '#F87171', fontSize: '12px', marginBottom: '16px' }}>
            {errors.global}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Select Artisan (Karigar) *</label>
              <select
                value={formData.karigarId}
                onChange={(e) => setFormData({ ...formData, karigarId: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {karigars.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name} ({k.skill})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Product Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Filigree Payal, Rope Chain"
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Issued Weight (g) *</label>
                <input
                  type="number"
                  step="0.001"
                  min="0.1"
                  required
                  value={formData.weightIssued}
                  onChange={(e) => setFormData({ ...formData, weightIssued: Number(e.target.value) })}
                  style={{ ...inputStyle, fontFamily: "'JetBrains Mono',monospace" }}
                />
              </div>
              <div>
                <label style={labelStyle}>Expected Fine (g) *</label>
                <input
                  type="number"
                  step="0.001"
                  min="0.1"
                  required
                  value={formData.expectedFine}
                  onChange={(e) => setFormData({ ...formData, expectedFine: Number(e.target.value) })}
                  style={{ ...inputStyle, fontFamily: "'JetBrains Mono',monospace" }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Order Reference</label>
                <input
                  type="text"
                  placeholder="ORD-2241"
                  value={formData.orderRef}
                  onChange={(e) => setFormData({ ...formData, orderRef: e.target.value })}
                  style={{ ...inputStyle, fontFamily: "'JetBrains Mono',monospace" }}
                />
              </div>
              <div>
                <label style={labelStyle}>Due Date</label>
                <input
                  type="text"
                  placeholder="20 Jun"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ height: '36px', padding: '0 16px', background: 'transparent', border: '1px solid #242428', color: '#8A9099', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ height: '36px', padding: '0 20px', background: '#C8D0D8', color: '#0A0A0B', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', fontSize: '13px' }}
            >
              {isSubmitting ? 'Assigning...' : 'Assign Work'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
