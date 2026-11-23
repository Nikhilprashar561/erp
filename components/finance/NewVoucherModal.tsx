'use client';
import React, { useState } from 'react';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { useUIStore } from '@/stores/useUIStore';
import { CreateVoucherSchema, type CreateVoucherInput } from '@/lib/validations/finance.schema';

interface NewVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewVoucherModal({ isOpen, onClose }: NewVoucherModalProps) {
  const { recordVoucher } = useFinanceStore();
  const showToast = useUIStore((s) => s.showToast);

  const [category, setCategory] = useState('Karigar & Labour');
  const [amount, setAmount] = useState(25000);
  const [voucherType, setVoucherType] = useState<'DEBIT' | 'CREDIT'>('DEBIT');
  const [paymentMode, setPaymentMode] = useState<'BANK' | 'CASH'>('BANK');
  const [description, setDescription] = useState('Fortnightly workshop expense');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload: CreateVoucherInput = {
      category,
      amount: Number(amount),
      voucherType,
      paymentMode,
      description,
    };

    const validated = CreateVoucherSchema.safeParse(payload);
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
    const res = await recordVoucher(payload);
    setIsSubmitting(false);

    if (res.success) {
      showToast(`Voucher ₹ ${amount.toLocaleString('en-IN')} recorded`);
      onClose();
    } else {
      showToast(res.error || 'Failed to record voucher');
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
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#F0F2F4' }}>Record Accounting Voucher</div>
            <div style={{ fontSize: '11px', color: '#8A9099', marginTop: '2px' }}>
              Create debit/credit vouchers for operational expenses
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
          {/* Category */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Expense Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
              <option value="Karigar & Labour">Karigar & Artisan Labour</option>
              <option value="Silver Bullion Purchase">Silver Bullion Purchase</option>
              <option value="Utilities & Workshop Rent">Utilities & Workshop Rent</option>
              <option value="Administration & Staff">Administration & Staff</option>
              <option value="Packaging & Courier">Packaging & Courier</option>
            </select>
          </div>

          {/* Voucher Type & Payment Mode */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Voucher Type</label>
              <select value={voucherType} onChange={(e) => setVoucherType(e.target.value as any)} style={inputStyle}>
                <option value="DEBIT">Debit Voucher</option>
                <option value="CREDIT">Credit Voucher</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Account</label>
              <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value as any)} style={inputStyle}>
                <option value="BANK">Bank Account</option>
                <option value="CASH">Cash in Hand</option>
              </select>
            </div>
          </div>

          {/* Amount */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              style={inputStyle}
            />
            {errors.amount && <div style={{ color: '#F87171', fontSize: '11px', marginTop: '4px' }}>{errors.amount}</div>}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Narration / Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={inputStyle}
              placeholder="e.g. Acid purchase, courier charges"
            />
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
              {isSubmitting ? 'Posting...' : 'Post Voucher'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}