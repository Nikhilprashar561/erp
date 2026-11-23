'use client';
import React, { useState, useEffect } from 'react';
import { useOutsourcingStore } from '@/stores/useOutsourcingStore';
import { useOrderStore } from '@/stores/useOrderStore';
import { useUIStore } from '@/stores/useUIStore';
import { CreateJobOrderSchema, type CreateJobOrderInput } from '@/lib/validations/outsourcing.schema';

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultWorkerId?: string;
}

export default function NewJobModal({ isOpen, onClose, defaultWorkerId }: NewJobModalProps) {
  const { workers, createJobOrder } = useOutsourcingStore();
  const { orders, fetchOrders } = useOrderStore();
  const showToast = useUIStore((s) => s.showToast);

  const [workerId, setWorkerId] = useState(defaultWorkerId || '');
  const [orderId, setOrderId] = useState('');
  const [jobType, setJobType] = useState('Polishing');
  const [weightSent, setWeightSent] = useState(100.0);
  const [dueDate, setDueDate] = useState('20 Jun');
  const [labourCost, setLabourCost] = useState(5000);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (orders.length === 0) fetchOrders();
  }, [orders.length, fetchOrders]);

  useEffect(() => {
    if (defaultWorkerId) {
      setWorkerId(defaultWorkerId);
    } else if (workers.length > 0 && !workerId) {
      setWorkerId(workers[0].id);
    }
  }, [defaultWorkerId, workers, workerId]);

  useEffect(() => {
    if (orders.length > 0 && !orderId) {
      setOrderId(orders[0].id);
    }
  }, [orders, orderId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload: CreateJobOrderInput = {
      workerId,
      orderId,
      jobType,
      weightSent: Number(weightSent),
      dueDate,
      labourCost: Number(labourCost),
    };

    const validated = CreateJobOrderSchema.safeParse(payload);
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
    const res = await createJobOrder(payload);
    setIsSubmitting(false);

    if (res.success) {
      showToast('Outsourcing job order created');
      onClose();
    } else {
      showToast(res.error || 'Failed to create job order');
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
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#F0F2F4' }}>New Job Order (Outsourcing)</div>
            <div style={{ fontSize: '11px', color: '#8A9099', marginTop: '2px' }}>
              Issue silver to external job worker
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
          {/* Worker */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Job Worker</label>
            <select
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              style={inputStyle}
            >
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.spec}) · {w.held.toFixed(3)} g held
                </option>
              ))}
            </select>
            {errors.workerId && <div style={{ color: '#F87171', fontSize: '11px', marginTop: '4px' }}>{errors.workerId}</div>}
          </div>

          {/* Order Ref */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Order Reference</label>
            <select
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              style={inputStyle}
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.no} · {o.client}
                </option>
              ))}
            </select>
            {errors.orderId && <div style={{ color: '#F87171', fontSize: '11px', marginTop: '4px' }}>{errors.orderId}</div>}
          </div>

          {/* Job Type */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Job Type / Process</label>
            <input
              type="text"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              style={inputStyle}
              placeholder="e.g. Polishing, Casting, Stone Setting, Plating"
            />
            {errors.jobType && <div style={{ color: '#F87171', fontSize: '11px', marginTop: '4px' }}>{errors.jobType}</div>}
          </div>

          {/* Weight Sent & Labour */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Silver Sent (g)</label>
              <input
                type="number"
                step="0.001"
                value={weightSent}
                onChange={(e) => setWeightSent(parseFloat(e.target.value) || 0)}
                style={inputStyle}
              />
              {errors.weightSent && <div style={{ color: '#F87171', fontSize: '11px', marginTop: '4px' }}>{errors.weightSent}</div>}
            </div>
            <div>
              <label style={labelStyle}>Labour Cost (₹)</label>
              <input
                type="number"
                value={labourCost}
                onChange={(e) => setLabourCost(parseFloat(e.target.value) || 0)}
                style={inputStyle}
              />
              {errors.labourCost && <div style={{ color: '#F87171', fontSize: '11px', marginTop: '4px' }}>{errors.labourCost}</div>}
            </div>
          </div>

          {/* Due Date */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Due Date</label>
            <input
              type="text"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={inputStyle}
              placeholder="e.g. 20 Jun"
            />
            {errors.dueDate && <div style={{ color: '#F87171', fontSize: '11px', marginTop: '4px' }}>{errors.dueDate}</div>}
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
              {isSubmitting ? 'Creating...' : 'Issue Job'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}