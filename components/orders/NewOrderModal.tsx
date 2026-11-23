'use client';
import React, { useState, useEffect } from 'react';
import { useOrderStore } from '@/stores/useOrderStore';
import { useClientStore } from '@/stores/useClientStore';
import { useUIStore } from '@/stores/useUIStore';
import { CreateOrderSchema, type CreateOrderInput, type OrderItemInput } from '@/lib/validations/order.schema';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewOrderModal({ isOpen, onClose }: NewOrderModalProps) {
  const { createOrder, isSubmitting } = useOrderStore();
  const { clients, fetchClients } = useClientStore();
  const rate = useUIStore((s) => s.rate);
  const showToast = useUIStore((s) => s.showToast);

  const [clientId, setClientId] = useState('');
  const [dueDate, setDueDate] = useState('24 Jun');
  const [rateLocked, setRateLocked] = useState(rate);
  const [items, setItems] = useState<OrderItemInput[]>([
    { name: 'Payal (Anklet)', quantity: 24, grossWeight: 500.0, fineWeight: 462.5, makingChargeRate: 25 },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (clients.length === 0) {
      fetchClients();
    }
  }, [clients.length, fetchClients]);

  useEffect(() => {
    if (clients.length > 0 && !clientId) {
      setClientId(clients[0].id);
    }
  }, [clients, clientId]);

  useEffect(() => {
    if (rate && rateLocked === 89420) {
      setRateLocked(rate);
    }
  }, [rate, rateLocked]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([
      ...items,
      { name: 'Kada (Bangle)', quantity: 10, grossWeight: 200.0, fineWeight: 185.0, makingChargeRate: 20 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof OrderItemInput, val: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: val };
    setItems(updated);
  };

  // Calculations
  let totalGross = 0;
  let totalFine = 0;
  let totalMaking = 0;
  let totalSilverVal = 0;

  items.forEach((it) => {
    totalGross += Number(it.grossWeight) || 0;
    totalFine += Number(it.fineWeight) || 0;
    const silverVal = (Number(it.fineWeight) || 0) * (rateLocked / 1000);
    const making = (Number(it.grossWeight) || 0) * (Number(it.makingChargeRate) || 0);
    totalSilverVal += silverVal;
    totalMaking += making;
  });
  const grandTotal = totalSilverVal + totalMaking;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload: CreateOrderInput = {
      clientId,
      dueDate,
      rateLocked,
      items,
    };

    const validated = CreateOrderSchema.safeParse(payload);
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

    const clientName = clients.find((c) => c.id === clientId)?.name;
    const res = await createOrder(validated.data, clientName);

    if (res.success) {
      showToast(`Order ${res.orderNo || ''} created successfully!`);
      onClose();
    } else {
      setErrors({ global: res.error || 'Failed to create order' });
    }
  };

  const inputStyle = {
    width: '100%',
    height: '34px',
    background: '#141418',
    border: '1px solid #242428',
    borderRadius: '6px',
    padding: '0 10px',
    color: '#F0F2F4',
    fontSize: '12px',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '.07em',
    color: '#8A9099',
    marginBottom: '5px',
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, backdropFilter: 'blur(2px)' }} />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: '780px',
          background: '#111113',
          border: '1px solid #242428',
          borderRadius: '10px',
          zIndex: 101,
          boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
          padding: '24px',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 600, color: '#F0F2F4' }}>Create New Manufacturing Order</div>
            <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '2px' }}>Lock live MCX silver price and define product items</div>
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
          {/* Header Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.5fr', gap: '12px', marginBottom: '18px', background: '#0E0E10', padding: '14px', borderRadius: '8px', border: '1px solid #1C1C20' }}>
            <div>
              <label style={labelStyle}>Select Client *</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Due Date *</label>
              <input
                type="text"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={inputStyle}
                placeholder="e.g. 25 Jun"
              />
            </div>
            <div>
              <label style={labelStyle}>
                Silver Rate Lock (₹/kg) *
                <span style={{ color: '#4ADE80', marginLeft: '6px', fontSize: '9px' }}>LIVE MCX</span>
              </label>
              <input
                type="number"
                step="10"
                required
                value={rateLocked}
                onChange={(e) => setRateLocked(Number(e.target.value))}
                style={{ ...inputStyle, fontFamily: "'JetBrains Mono',monospace", color: '#4ADE80', fontWeight: 600 }}
              />
            </div>
          </div>

          {/* Product Items Table */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: '#8A9099' }}>
                Product Items ({items.length})
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                style={{ fontSize: '11px', color: '#60A5FA', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 500 }}
              >
                + Add Another Item
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {items.map((it, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2.5fr 0.8fr 1.2fr 1.2fr 1.2fr 30px',
                    gap: '8px',
                    alignItems: 'center',
                    background: '#0E0E10',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #1C1C20',
                  }}
                >
                  <div>
                    <input
                      type="text"
                      placeholder="Product Name"
                      value={it.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      title="Quantity (Pieces)"
                      value={it.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                      style={{ ...inputStyle, fontFamily: "'JetBrains Mono',monospace", textAlign: 'right' }}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="Gross (g)"
                      title="Gross Weight in Grams"
                      value={it.grossWeight}
                      onChange={(e) => handleItemChange(idx, 'grossWeight', Number(e.target.value))}
                      style={{ ...inputStyle, fontFamily: "'JetBrains Mono',monospace", textAlign: 'right' }}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="Fine (g)"
                      title="Fine Weight in Grams"
                      value={it.fineWeight}
                      onChange={(e) => handleItemChange(idx, 'fineWeight', Number(e.target.value))}
                      style={{ ...inputStyle, fontFamily: "'JetBrains Mono',monospace", textAlign: 'right' }}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      step="1"
                      placeholder="Making ₹/g"
                      title="Making Charges per Gram"
                      value={it.makingChargeRate}
                      onChange={(e) => handleItemChange(idx, 'makingChargeRate', Number(e.target.value))}
                      style={{ ...inputStyle, fontFamily: "'JetBrains Mono',monospace", textAlign: 'right' }}
                    />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        style={{ background: 'transparent', border: 'none', color: '#F87171', cursor: 'pointer', fontSize: '15px' }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Preview Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr 1.5fr', gap: '8px', background: '#18181C', padding: '12px 14px', borderRadius: '8px', border: '1px solid #242428', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '10px', color: '#8A9099' }}>Total Gross</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '14px', color: '#F0F2F4', marginTop: '3px' }}>
                {totalGross.toFixed(3)} g
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#8A9099' }}>Total Fine</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '14px', color: '#C8D0D8', marginTop: '3px' }}>
                {totalFine.toFixed(3)} g
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#8A9099' }}>Est. Making</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '14px', color: '#8A9099', marginTop: '3px' }}>
                ₹ {Math.round(totalMaking).toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: '#8A9099' }}>Order Value (Silver + Labour)</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '16px', color: '#4ADE80', fontWeight: 600, marginTop: '3px' }}>
                ₹ {Math.round(grandTotal).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
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
              style={{ height: '36px', padding: '0 24px', background: '#C8D0D8', color: '#0A0A0B', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', fontSize: '13px' }}
            >
              {isSubmitting ? 'Creating Order...' : 'Confirm Order & Lock Rate'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
