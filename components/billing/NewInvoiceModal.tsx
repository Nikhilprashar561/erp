'use client';
import React, { useState, useEffect } from 'react';
import { useBillingStore } from '@/stores/useBillingStore';
import { useOrderStore } from '@/stores/useOrderStore';
import { useUIStore } from '@/stores/useUIStore';
import { GenerateInvoiceSchema, type GenerateInvoiceInput } from '@/lib/validations/invoice.schema';

interface NewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewInvoiceModal({ isOpen, onClose }: NewInvoiceModalProps) {
  const { generateInvoice } = useBillingStore();
  const { orders, fetchOrders } = useOrderStore();
  const showToast = useUIStore((s) => s.showToast);

  const [orderId, setOrderId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('14 Jun 2025');
  const [applyGst, setApplyGst] = useState(true);
  const [isInterState, setIsInterState] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (orders.length === 0) fetchOrders();
  }, [orders.length, fetchOrders]);

  useEffect(() => {
    if (orders.length > 0 && !orderId) {
      setOrderId(orders[0].id);
    }
  }, [orders, orderId]);

  if (!isOpen) return null;

  const selectedOrder = orders.find((o) => o.id === orderId || o.no === orderId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload: GenerateInvoiceInput = {
      orderId,
      invoiceDate,
      applyGst,
      isInterState,
    };

    const validated = GenerateInvoiceSchema.safeParse(payload);
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
    const res = await generateInvoice(payload);
    setIsSubmitting(false);

    if (res.success) {
      showToast(`Invoice ${res.invoiceNo} raised successfully`);
      onClose();
    } else {
      showToast(res.error || 'Failed to generate invoice');
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
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#F0F2F4' }}>Generate GST Invoice</div>
            <div style={{ fontSize: '11px', color: '#8A9099', marginTop: '2px' }}>
              Create official tax invoice from manufacturing order
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
          {/* Order Selection */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Manufacturing Order</label>
            <select value={orderId} onChange={(e) => setOrderId(e.target.value)} style={inputStyle}>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.no} · {o.client} ({o.products})
                </option>
              ))}
            </select>
            {errors.orderId && <div style={{ color: '#F87171', fontSize: '11px', marginTop: '4px' }}>{errors.orderId}</div>}
          </div>

          {/* Invoice Date */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Invoice Date</label>
            <input
              type="text"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Order Details Preview Box */}
          {selectedOrder && (
            <div
              style={{
                background: '#0E0E10',
                border: '1px solid #1C1C20',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '16px',
                fontSize: '11px',
                color: '#8A9099',
              }}
            >
              <div style={{ color: '#E2E8ED', fontWeight: 500, marginBottom: '4px' }}>
                Client: {selectedOrder.client}
              </div>
              <div>Products: {selectedOrder.products}</div>
              <div style={{ marginTop: '4px' }}>
                Fine Weight: {selectedOrder.fine.toFixed(3)} g · Rate Locked: ₹ {selectedOrder.rateLocked.toLocaleString('en-IN')}/kg
              </div>
            </div>
          )}

          {/* GST Toggles */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#C8D0D8', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={applyGst}
                onChange={(e) => setApplyGst(e.target.checked)}
              />
              Apply GST (3.0%)
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#C8D0D8', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isInterState}
                onChange={(e) => setIsInterState(e.target.checked)}
              />
              Inter-State (IGST)
            </label>
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
              {isSubmitting ? 'Generating...' : 'Raise Invoice'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}