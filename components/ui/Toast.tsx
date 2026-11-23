'use client';
import React, { useEffect, useState } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { useApp } from '@/lib/store/AppContext';

export default function Toast() {
  const uiToast = useUIStore((s) => s.toast);
  let appContextToast: string | null = null;
  try {
    const app = useApp();
    appContextToast = app.toast;
  } catch {
    // AppContext optional
  }

  const activeToast = uiToast || appContextToast;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (activeToast) setVisible(true);
    else {
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [activeToast]);

  if (!activeToast && !visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 200,
        background: '#18181C',
        border: '1px solid #33333a',
        borderRadius: '8px',
        padding: '11px 16px',
        color: '#E2E8ED',
        fontSize: '13px',
        boxShadow: '0 8px 24px rgba(0,0,0,.5)',
        animation: activeToast ? 'ssToast .18s ease forwards' : 'ssFade .2s ease reverse forwards',
        fontFamily: 'Inter, system-ui, sans-serif',
        maxWidth: '320px',
      }}
    >
      {activeToast}
    </div>
  );
}
