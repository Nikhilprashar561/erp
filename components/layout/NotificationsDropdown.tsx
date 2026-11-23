'use client';
import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { useDashboardStore } from '@/stores/useDashboardStore';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsDropdown({ isOpen, onClose }: NotificationsDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { metrics } = useDashboardStore();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const alerts = metrics?.alerts && metrics.alerts.length > 0
    ? metrics.alerts
    : [
        { id: '1', type: 'danger' as const, title: 'Overdue Delivery: ORD-2238', desc: 'Shree Ganesh Orn. · Due 16 Jun' },
        { id: '2', type: 'danger' as const, title: 'Karigar Risk Alert: Imran Soni', desc: 'Holding 88.000g silver · Exceeded scrap threshold' },
        { id: '3', type: 'warning' as const, title: 'Low Stock: Rods 925 (Main Vault)', desc: 'Current 45 pcs below safety reorder level' },
        { id: '4', type: 'info' as const, title: 'Payment Realized: ₹ 1,50,000', desc: 'Kalyan Silver House via NEFT' },
      ];

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: '40px',
        right: 0,
        width: '340px',
        background: '#111113',
        border: '1px solid #2E2E36',
        borderRadius: '10px',
        boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
        zIndex: 60,
        overflow: 'hidden',
        animation: 'ssFade 0.12s ease-out',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid #1C1C20',
          background: '#141418',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#F0F2F4' }}>System Alerts</span>
          <span
            style={{
              fontSize: '10px',
              fontFamily: "'JetBrains Mono',monospace",
              background: 'rgba(248,113,113,0.18)',
              color: '#F87171',
              padding: '1px 6px',
              borderRadius: '4px',
              fontWeight: 600,
            }}
          >
            {alerts.length} Active
          </span>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: '#8A9099', cursor: 'pointer', fontSize: '15px' }}
        >
          ×
        </button>
      </div>

      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {alerts.map((al) => {
          const dotColor = al.type === 'danger' ? '#F87171' : al.type === 'warning' ? '#FFC840' : '#60A5FA';
          return (
            <div
              key={al.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '12px 16px',
                borderBottom: '1px solid #1C1C20',
                transition: 'background 0.1s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#16161A')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: dotColor,
                  flexShrink: 0,
                  marginTop: '5px',
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#E2E8ED', lineHeight: 1.3 }}>
                  {al.title}
                </div>
                <div style={{ fontSize: '11px', color: '#8A9099', marginTop: '2px', lineHeight: 1.4 }}>
                  {al.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          padding: '10px 16px',
          background: '#0D0D0F',
          borderTop: '1px solid #1C1C20',
          textAlign: 'center',
        }}
      >
        <Link
          href="/"
          onClick={onClose}
          style={{
            fontSize: '11px',
            color: '#60A5FA',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          View all in Command Center →
        </Link>
      </div>
    </div>
  );
}
