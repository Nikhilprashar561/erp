'use client';
import React, { useState } from 'react';
import { useMovementStore } from '@/stores/useMovementStore';
import { useUIStore } from '@/stores/useUIStore';
import { CreateMovementSchema, type CreateMovementInput } from '@/lib/validations/movement.schema';

interface RecordMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RecordMovementModal({ isOpen, onClose }: RecordMovementModalProps) {
  const { recordMovement } = useMovementStore();
  const showToast = useUIStore((s) => s.showToast);

  const [movementType, setMovementType] = useState<'RECEIPT' | 'ISSUE' | 'TRANSFER' | 'RETURN' | 'DISPATCH'>('TRANSFER');
  const [fromLocation, setFromLocation] = useState('Vault A');
  const [toLocation, setToLocation] = useState('Vault B');
  const [referenceNo, setReferenceNo] = useState('TRF-221');
  const [fineWeight, setFineWeight] = useState(250.0);
  const [createdByName, setCreatedByName] = useState('Store Keeper');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload: CreateMovementInput = {
      movementType,
      fromLocation,
      toLocation,
      referenceNo,
      fineWeight: Number(fineWeight),
      createdByName,
    };

    const validated = CreateMovementSchema.safeParse(payload);
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
    const res = await recordMovement(payload);
    setIsSubmitting(false);

    if (res.success) {
      showToast(`${movementType} transfer of ${fineWeight.toFixed(3)} g recorded`);
      onClose();
    } else {
      showToast(res.error || 'Failed to record movement');
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
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#F0F2F4' }}>Record Material Movement</div>
            <div style={{ fontSize: '11px', color: '#8A9099', marginTop: '2px' }}>
              Computerized silver transfer slip between vaults & parties
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
          {/* Movement Type */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Movement Type</label>
            <select
              value={movementType}
              onChange={(e) => setMovementType(e.target.value as any)}
              style={inputStyle}
            >
              <option value="TRANSFER">Internal Vault Transfer</option>
              <option value="RECEIPT">Receipt (Inward from Client/Vendor)</option>
              <option value="ISSUE">Issue (To Karigar/Production)</option>
              <option value="RETURN">Return (From Karigar/Vendor to Vault)</option>
              <option value="DISPATCH">Dispatch (Outward to Client)</option>
            </select>
          </div>

          {/* From & To Locations */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>From Location / Party</label>
              <input
                type="text"
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                style={inputStyle}
                placeholder="e.g. Vault A, Mehta Jewels"
              />
              {errors.fromLocation && <div style={{ color: '#F87171', fontSize: '11px', marginTop: '4px' }}>{errors.fromLocation}</div>}
            </div>
            <div>
              <label style={labelStyle}>To Location / Party</label>
              <input
                type="text"
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                style={inputStyle}
                placeholder="e.g. Vault B, Ramesh Soni"
              />
              {errors.toLocation && <div style={{ color: '#F87171', fontSize: '11px', marginTop: '4px' }}>{errors.toLocation}</div>}
            </div>
          </div>

          {/* Weight & Reference */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Fine Weight (grams)</label>
              <input
                type="number"
                step="0.001"
                value={fineWeight}
                onChange={(e) => setFineWeight(parseFloat(e.target.value) || 0)}
                style={inputStyle}
              />
              {errors.fineWeight && <div style={{ color: '#F87171', fontSize: '11px', marginTop: '4px' }}>{errors.fineWeight}</div>}
            </div>
            <div>
              <label style={labelStyle}>Reference No.</label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                style={inputStyle}
                placeholder="e.g. ORD-2241, TRF-221"
              />
              {errors.referenceNo && <div style={{ color: '#F87171', fontSize: '11px', marginTop: '4px' }}>{errors.referenceNo}</div>}
            </div>
          </div>

          {/* Authorized By */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Authorized Employee</label>
            <input
              type="text"
              value={createdByName}
              onChange={(e) => setCreatedByName(e.target.value)}
              style={inputStyle}
              placeholder="e.g. Store Keeper, R. Kothari"
            />
            {errors.createdByName && <div style={{ color: '#F87171', fontSize: '11px', marginTop: '4px' }}>{errors.createdByName}</div>}
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                height: '32px',
                padding: '0 14px',
                background: 'transparent',
                border: '1px solid #242428',
                borderRadius: '6px',
                color: '#8A9099',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                height: '32px',
                padding: '0 16px',
                background: '#C8D0D8',
                color: '#0A0A0B',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              {isSubmitting ? 'Recording...' : 'Record Slip'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}