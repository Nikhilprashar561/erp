'use client';
import React, { useState, useEffect } from 'react';
import { useProductionStore } from '@/stores/useProductionStore';
import { useOrderStore } from '@/stores/useOrderStore';
import { useKarigarStore } from '@/stores/useKarigarStore';
import { useUIStore } from '@/stores/useUIStore';
import { CreateBatchSchema, type CreateBatchInput } from '@/lib/validations/production.schema';

interface NewBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewBatchModal({ isOpen, onClose }: NewBatchModalProps) {
  const { createBatch } = useProductionStore();
  const { orders, fetchOrders } = useOrderStore();
  const { karigars, fetchKarigars } = useKarigarStore();
  const showToast = useUIStore((s) => s.showToast);

  const [orderId, setOrderId] = useState('');
  const [karigarId, setKarigarId] = useState('');
  const [product, setProduct] = useState('Payal');
  const [weight, setWeight] = useState(150.0);
  const [stage, setStage] = useState<'MELTING' | 'ROD_MAKING' | 'CUTTING' | 'FORMING' | 'POLISHING' | 'QC' | 'DISPATCH'>('MELTING');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (orders.length === 0) fetchOrders();
    if (karigars.length === 0) fetchKarigars();
  }, [orders.length, karigars.length, fetchOrders, fetchKarigars]);

  useEffect(() => {
    if (orders.length > 0 && !orderId) {
      setOrderId(orders[0].id);
    }
  }, [orders, orderId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload: CreateBatchInput = {
      orderId,
      karigarId: karigarId || undefined,
      product,
      weight: Number(weight),
      stage,
    };

    const validated = CreateBatchSchema.safeParse(payload);
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
    const res = await createBatch(payload);
    setIsSubmitting(false);

    if (res.success) {
      showToast('New production batch created');
      onClose();
    } else {
      showToast(res.error || 'Failed to create batch');
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
          maxWidth: '440px',
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
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#F0F2F4' }}>Create Production Batch</div>
            <div style={{ fontSize: '11px', color: '#8A9099', marginTop: '2px' }}>
              Assign raw silver to manufacturing stage
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
          {/* Order selection */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Order Reference</label>
            <select
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              style={inputStyle}
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.no} · {o.client} ({o.products})
                </option>
              ))}
            </select>
            {errors.orderId && <div style={{ color: '#F87171', fontSize: '11px', marginTop: '4px' }}>{errors.orderId}</div>}
          </div>

          {/* Product Name */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Product</label>
            <input
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              style={inputStyle}
              placeholder="e.g. Payal, Kada, Chain Roll"
            />
            {errors.product && <div style={{ color: '#F87171', fontSize: '11px', marginTop: '4px' }}>{errors.product}</div>}
          </div>

          {/* Assigned Karigar */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Assigned Karigar (Optional)</label>
            <select
              value={karigarId}
              onChange={(e) => setKarigarId(e.target.value)}
              style={inputStyle}
            >
              <option value="">-- Unassigned --</option>
              {karigars.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name} ({k.skill})
                </option>
              ))}
            </select>
          </div>

          {/* Initial Stage & Weight */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as any)}
                style={inputStyle}
              >
                <option value="MELTING">Melting</option>
                <option value="ROD_MAKING">Rod Making</option>
                <option value="CUTTING">Cutting</option>
                <option value="FORMING">Forming</option>
                <option value="POLISHING">Polishing</option>
                <option value="QC">QC</option>
                <option value="DISPATCH">Dispatch</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Weight (grams)</label>
              <input
                type="number"
                step="0.001"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                style={inputStyle}
              />
              {errors.weight && <div style={{ color: '#F87171', fontSize: '11px', marginTop: '4px' }}>{errors.weight}</div>}
            </div>
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
              {isSubmitting ? 'Creating...' : 'Create Batch'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}