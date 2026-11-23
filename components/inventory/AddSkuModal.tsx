'use client';
import React, { useState, useEffect } from 'react';
import { useInventoryStore } from '@/stores/useInventoryStore';
import { useUIStore } from '@/stores/useUIStore';
import { CreateInventoryItemSchema, type CreateInventoryItemInput } from '@/lib/validations/inventory.schema';

interface AddSkuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddSkuModal({ isOpen, onClose }: AddSkuModalProps) {
  const { categories, purities, createInventoryItem, fetchInventory } = useInventoryStore();
  const showToast = useUIStore((s) => s.showToast);

  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [purityId, setPurityId] = useState('');
  const [pieces, setPieces] = useState(12);
  const [grossWeight, setGrossWeight] = useState(500.0);
  const [fineWeight, setFineWeight] = useState(462.5);
  const [location, setLocation] = useState('Vault A');
  const [status, setStatus] = useState<'IN_STOCK' | 'LOW' | 'REORDER'>('IN_STOCK');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (categories.length === 0 || purities.length === 0) {
      fetchInventory();
    }
  }, [categories.length, purities.length, fetchInventory]);

  useEffect(() => {
    if (categories.length > 0 && !categoryId) setCategoryId(categories[0].id);
    if (purities.length > 0 && !purityId) setPurityId(purities[0].id);
  }, [categories, purities, categoryId, purityId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload: CreateInventoryItemInput = {
      sku: sku.trim().toUpperCase(),
      categoryId,
      purityId,
      pieces: Number(pieces),
      grossWeight: Number(grossWeight),
      fineWeight: Number(fineWeight),
      location,
      status,
    };

    const validated = CreateInventoryItemSchema.safeParse(payload);
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
    const res = await createInventoryItem(payload);
    setIsSubmitting(false);

    if (res.success) {
      showToast(`SKU ${payload.sku} added to ${location}`);
      onClose();
    } else {
      showToast(res.error || 'Failed to add SKU');
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
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#F0F2F4' }}>Add Inventory SKU</div>
            <div style={{ fontSize: '11px', color: '#8A9099', marginTop: '2px' }}>
              Register finished goods or raw silver in vaults
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
          {/* SKU */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>SKU Code</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              style={inputStyle}
              placeholder="e.g. PYL-925-025, RAW-999-BAR"
            />
            {errors.sku && <div style={{ color: '#F87171', fontSize: '11px', marginTop: '4px' }}>{errors.sku}</div>}
          </div>

          {/* Category & Purity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={inputStyle}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Purity</label>
              <select value={purityId} onChange={(e) => setPurityId(e.target.value)} style={inputStyle}>
                {purities.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.standard}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pieces, Gross & Fine */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Pieces</label>
              <input
                type="number"
                value={pieces}
                onChange={(e) => setPieces(parseInt(e.target.value, 10) || 1)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Gross (g)</label>
              <input
                type="number"
                step="0.001"
                value={grossWeight}
                onChange={(e) => setGrossWeight(parseFloat(e.target.value) || 0)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Fine (g)</label>
              <input
                type="number"
                step="0.001"
                value={fineWeight}
                onChange={(e) => setFineWeight(parseFloat(e.target.value) || 0)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Vault Location & Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Location</label>
              <select value={location} onChange={(e) => setLocation(e.target.value)} style={inputStyle}>
                <option value="Vault A">Vault A (Primary Safe)</option>
                <option value="Vault B">Vault B (Bullion Safe)</option>
                <option value="Display">Showroom Display</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                style={inputStyle}
              >
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW">Low Stock</option>
                <option value="REORDER">Reorder Required</option>
              </select>
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
              {isSubmitting ? 'Saving...' : 'Add SKU'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}