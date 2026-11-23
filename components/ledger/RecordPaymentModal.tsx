'use client';
import React, { useState, useEffect } from 'react';
import { useLedgerStore } from '@/stores/useLedgerStore';
import { useClientStore } from '@/stores/useClientStore';
import { useKarigarStore } from '@/stores/useKarigarStore';
import { useUIStore } from '@/stores/useUIStore';
import { RecordPaymentSchema, type RecordPaymentInput } from '@/lib/validations/ledger.schema';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RecordPaymentModal({ isOpen, onClose }: RecordPaymentModalProps) {
  const { recordPayment } = useLedgerStore();
  const { clients, fetchClients } = useClientStore();
  const { karigars, fetchKarigars } = useKarigarStore();
  const showToast = useUIStore((s) => s.showToast);

  const [paymentType, setPaymentType] = useState<'CLIENT_PAYMENT' | 'KARIGAR_WAGE' | 'EXPENSE_PAYMENT'>('CLIENT_PAYMENT');
  const [partyName, setPartyName] = useState('');
  const [referenceNo, setReferenceNo] = useState(`PAY-${Date.now().toString().slice(-4)}`);
  const [amount, setAmount] = useState(50000);
  const [mode, setMode] = useState<'NEFT_RTGS' | 'UPI' | 'CASH' | 'CHEQUE'>('NEFT_RTGS');
  const [remarks, setRemarks] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (clients.length === 0) fetchClients();
    if (karigars.length === 0) fetchKarigars();
  }, [clients.length, karigars.length, fetchClients, fetchKarigars]);

  useEffect(() => {
    if (paymentType === 'CLIENT_PAYMENT' && clients.length > 0 && !partyName) {
      setPartyName(clients[0].name);
    } else if (paymentType === 'KARIGAR_WAGE' && karigars.length > 0) {
      setPartyName(karigars[0].name);
    }
  }, [paymentType, clients, karigars, partyName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload: RecordPaymentInput = {
      partyName,
      referenceNo,
      paymentType,
      amount: Number(amount),
      mode,
      remarks: remarks || `${paymentType.replace('_', ' ')} via ${mode}`,
    };

    const validated = RecordPaymentSchema.safeParse(payload);
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
    const res = await recordPayment(payload);
    setIsSubmitting(false);

    if (res.success) {
      showToast(`Payment ₹ ${amount.toLocaleString('en-IN')} recorded for ${partyName}`);
      onClose();
    } else {
      showToast(res.error || 'Failed to record payment');
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
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#F0F2F4' }}>Record Dual Ledger Payment</div>
            <div style={{ fontSize: '11px', color: '#8A9099', marginTop: '2px' }}>
              Update client receivables or artisan labour wages
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
          {/* Payment Type */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Transaction Type</label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value as any)}
              style={inputStyle}
            >
              <option value="CLIENT_PAYMENT">Client Payment Receipt (INR In)</option>
              <option value="KARIGAR_WAGE">Karigar Labour Wage Payout (INR Out)</option>
              <option value="EXPENSE_PAYMENT">General Vendor / Expense Payout (INR Out)</option>
            </select>
          </div>

          {/* Party Name */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Party / Account</label>
            {paymentType === 'CLIENT_PAYMENT' ? (
              <select value={partyName} onChange={(e) => setPartyName(e.target.value)} style={inputStyle}>
                {clients.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} · Outstanding: ₹ {(c.inrOut || 0).toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            ) : paymentType === 'KARIGAR_WAGE' ? (
              <select value={partyName} onChange={(e) => setPartyName(e.target.value)} style={inputStyle}>
                {karigars.map((k) => (
                  <option key={k.id} value={k.name}>
                    {k.name} ({k.skill}) · Wages: ₹ {(k.payable || 0).toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                style={inputStyle}
                placeholder="Vendor or payee name"
              />
            )}
            {errors.partyName && <div style={{ color: '#F87171', fontSize: '11px', marginTop: '4px' }}>{errors.partyName}</div>}
          </div>

          {/* Amount & Mode */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                style={inputStyle}
              />
              {errors.amount && <div style={{ color: '#F87171', fontSize: '11px', marginTop: '4px' }}>{errors.amount}</div>}
            </div>
            <div>
              <label style={labelStyle}>Payment Mode</label>
              <select value={mode} onChange={(e) => setMode(e.target.value as any)} style={inputStyle}>
                <option value="NEFT_RTGS">NEFT / RTGS / Bank</option>
                <option value="UPI">UPI / QR</option>
                <option value="CASH">Cash</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>
          </div>

          {/* Reference & Remarks */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Reference No.</label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                style={inputStyle}
                placeholder="e.g. PAY-771"
              />
            </div>
            <div>
              <label style={labelStyle}>Remarks</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                style={inputStyle}
                placeholder="Optional notes"
              />
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
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}