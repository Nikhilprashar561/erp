'use client';
import React, { useState } from 'react';
import { useClientStore } from '@/stores/useClientStore';
import { useUIStore } from '@/stores/useUIStore';
import { ClientSchema, type ClientInput } from '@/lib/validations/client.schema';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddClientModal({ isOpen, onClose }: AddClientModalProps) {
  const { createClient, isSubmitting } = useClientStore();
  const showToast = useUIStore((s) => s.showToast);

  const [formData, setFormData] = useState<ClientInput>({
    name: '',
    city: '',
    gstNumber: '',
    phone: '',
    email: '',
    creditSilverLimit: 1000,
    creditInrLimit: 500000,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validated = ClientSchema.safeParse(formData);
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

    const res = await createClient(validated.data);
    if (res.success) {
      showToast(`${formData.name} added successfully!`);
      onClose();
      setFormData({
        name: '',
        city: '',
        gstNumber: '',
        phone: '',
        email: '',
        creditSilverLimit: 1000,
        creditInrLimit: 500000,
      });
    } else {
      setErrors({ global: res.error || 'Failed to create client' });
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
          maxWidth: '520px',
          background: '#111113',
          border: '1px solid #242428',
          borderRadius: '10px',
          zIndex: 101,
          boxShadow: '0 20px 48px rgba(0,0,0,0.6)',
          padding: '24px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 600, color: '#F0F2F4' }}>Add New Client</div>
            <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '2px' }}>Enter party details, GST, and credit thresholds</div>
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
              <label style={labelStyle}>Client / Firm Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Mehta Jewels Pvt Ltd"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ ...inputStyle, borderColor: errors.name ? '#F87171' : '#242428' }}
              />
              {errors.name && <div style={{ fontSize: '11px', color: '#F87171', marginTop: '4px' }}>{errors.name}</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>City *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Surat"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  style={{ ...inputStyle, borderColor: errors.city ? '#F87171' : '#242428' }}
                />
                {errors.city && <div style={{ fontSize: '11px', color: '#F87171', marginTop: '4px' }}>{errors.city}</div>}
              </div>
              <div>
                <label style={labelStyle}>GST Number *</label>
                <input
                  type="text"
                  required
                  placeholder="24AABCM1234F1Z5"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                  style={{ ...inputStyle, fontFamily: "'JetBrains Mono',monospace", borderColor: errors.gstNumber ? '#F87171' : '#242428' }}
                />
                {errors.gstNumber && <div style={{ fontSize: '11px', color: '#F87171', marginTop: '4px' }}>{errors.gstNumber}</div>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Phone (Optional)</label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Email (Optional)</label>
                <input
                  type="email"
                  placeholder="accounts@mehtajewels.com"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Silver Credit Limit (g)</label>
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  value={formData.creditSilverLimit}
                  onChange={(e) => setFormData({ ...formData, creditSilverLimit: Number(e.target.value) })}
                  style={{ ...inputStyle, fontFamily: "'JetBrains Mono',monospace" }}
                />
              </div>
              <div>
                <label style={labelStyle}>INR Credit Limit (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.creditInrLimit}
                  onChange={(e) => setFormData({ ...formData, creditInrLimit: Number(e.target.value) })}
                  style={{ ...inputStyle, fontFamily: "'JetBrains Mono',monospace" }}
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
              {isSubmitting ? 'Saving...' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
