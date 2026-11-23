'use client';
import React, { useState } from 'react';
import { useMasterStore } from '@/stores/useMasterStore';
import { useUIStore } from '@/stores/useUIStore';
import { CreateMasterCategorySchema, type CreateMasterCategoryInput } from '@/lib/validations/master.schema';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddCategoryModal({ isOpen, onClose }: AddCategoryModalProps) {
  const { createCategory } = useMasterStore();
  const showToast = useUIStore((s) => s.showToast);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload: CreateMasterCategoryInput = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim() || undefined,
    };

    const validated = CreateMasterCategorySchema.safeParse(payload);
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
    const res = await createCategory(payload);
    setIsSubmitting(false);

    if (res.success) {
      showToast(`Category ${payload.code} - ${payload.name} created`);
      onClose();
    } else {
      showToast(res.error || 'Failed to create category');
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
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#F0F2F4' }}>Add Product Category</div>
            <div style={{ fontSize: '11px', color: '#8A9099', marginTop: '2px' }}>
              Define new jewellery master category
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
            <label style={labelStyle}>Category Code (e.g. PYL, KAD)</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="PYL"
              maxLength={6}
              style={{ ...inputStyle, fontFamily: "'JetBrains Mono',monospace", textTransform: 'uppercase' }}
            />
            {errors.code && <div style={{ color: '#F87171', fontSize: '11px', marginTop: '4px' }}>{errors.code}</div>}
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Payal (Anklet)"
              style={inputStyle}
            />
            {errors.name && <div style={{ color: '#F87171', fontSize: '11px', marginTop: '4px' }}>{errors.name}</div>}
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Description (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Traditional silver foot ornament"
              style={inputStyle}
            />
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
              {isSubmitting ? 'Saving...' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
