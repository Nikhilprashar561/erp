'use client';
import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store/AppContext';
import Icon from '@/components/ui/Icon';

export default function CommandBar() {
  const { rate, clock, newMenuOpen, toggleNewMenu, closeNewMenu, showToast, toggleMobileSidebar } = useApp();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const rateBase = 89000;
  const rateColor = rate >= rateBase ? '#4ADE80' : '#F87171';
  const delta = ((rate - rateBase) / rateBase) * 100;
  const rateDeltaStr = (delta >= 0 ? '▲ ' : '▼ ') + Math.abs(delta).toFixed(2) + '%';
  const rateStr = '₹ ' + rate.toLocaleString('en-IN');

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) closeNewMenu();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [closeNewMenu]);

  const newActions = [
    { label: 'New Order', icon: 'orders', onClick: () => { router.push('/orders'); showToast('New order draft started'); closeNewMenu(); } },
    { label: 'New Client', icon: 'clients', onClick: () => { router.push('/clients'); closeNewMenu(); } },
    { label: 'Record Payment', icon: 'payment', onClick: () => { router.push('/ledger'); showToast('Payment ₹ 1,00,000 recorded · ledger updated'); closeNewMenu(); } },
    { label: 'Add Silver', icon: 'diamond', onClick: () => { router.push('/ledger'); showToast('Silver receipt entry opened'); closeNewMenu(); } },
    { label: 'Create Bill', icon: 'billing', onClick: () => { router.push('/billing'); closeNewMenu(); } },
  ];

  return (
    <div style={{ height: '48px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 0, padding: '0 14px', background: '#0A0A0B', borderBottom: '1px solid #242428', position: 'relative', zIndex: 40 }}>
      {/* Hamburger Button (Mobile only) */}
      <button className="ss-show-mobile" onClick={toggleMobileSidebar} style={{ display: 'none', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', marginRight: '8px', color: '#C8D0D8' }}>
        <Icon name="menu" color="#C8D0D8" size={18} />
      </button>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: 'auto', marginRight: '16px', flexShrink: 0 }}>
        <div style={{ width: '22px', height: '22px', flexShrink: 0, border: '1.5px solid #C8D0D8', transform: 'rotate(45deg)', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: '4px', border: '1px solid #8A9099' }} />
        </div>
        <div className="ss-hide-mobile" style={{ fontWeight: 700, letterSpacing: '.14em', fontSize: '13px', color: '#F0F2F4' }}>
          SILVER<span style={{ color: '#8A9099', fontWeight: 500 }}>SUITE</span>
        </div>
      </div>

      {/* Search (Desktop only) */}
      <div className="ss-hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '9px', height: '32px', flex: 1, maxWidth: '440px', padding: '0 12px', background: '#111113', border: '1px solid #242428', borderRadius: '7px', cursor: 'text', color: '#8A9099' }}>
        <Icon name="search" color="#8A9099" size={14} />
        <span style={{ fontSize: '13px' }}>Search orders, clients, invoices, batches…</span>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: '3px' }}>
          <kbd style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', background: '#18181C', border: '1px solid #242428', borderRadius: '4px', padding: '1px 5px', color: '#8A9099' }}>⌘</kbd>
          <kbd style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', background: '#18181C', border: '1px solid #242428', borderRadius: '4px', padding: '1px 5px', color: '#8A9099' }}>K</kbd>
        </span>
      </div>

      <div style={{ flex: 1 }} />

      {/* MCX Silver Rate (Desktop only) */}
      <Link href="/finance" className="ss-hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '32px', padding: '0 13px', background: '#111113', border: '1px solid #242428', borderRadius: '7px', cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace", textDecoration: 'none' }}>
        <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', color: '#8A9099' }}>MCX SILVER</span>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#F0F2F4', fontVariantNumeric: 'tabular-nums' }}>{rateStr}</span>
        <span style={{ fontSize: '11px', color: rateColor }}>{rateDeltaStr}</span>
        <span style={{ fontSize: '11px', color: '#5a5a62' }}>{clock}</span>
      </Link>

      <div className="ss-hide-mobile" style={{ width: '12px' }} />

      {/* + New */}
      <div style={{ position: 'relative' }} ref={menuRef}>
        <button onClick={toggleNewMenu} style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '32px', padding: '0 13px', background: '#C8D0D8', color: '#0A0A0B', borderRadius: '7px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', border: 'none' }}>
          <span style={{ fontSize: '15px', lineHeight: 1, marginTop: '-1px' }}>+</span>
          <span className="ss-hide-mobile"> New</span>
        </button>
        {newMenuOpen && (
          <div style={{ position: 'absolute', top: '38px', right: 0, width: '208px', background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '6px', boxShadow: '0 12px 32px rgba(0,0,0,.55)', zIndex: 50, animation: 'ssFade .12s ease' }}>
            {newActions.map(a => (
              <button key={a.label} onClick={a.onClick} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 9px', borderRadius: '6px', cursor: 'pointer', color: '#C8D0D8', fontSize: '13px', width: '100%', background: 'transparent', border: 'none', textAlign: 'left' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#18181C')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <span style={{ width: '15px', height: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8A9099' }}>
                  <Icon name={a.icon} color="#8A9099" size={15} />
                </span>
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ width: '12px' }} />

      {/* Notifications */}
      <div style={{ position: 'relative', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111113', border: '1px solid #242428', borderRadius: '7px', cursor: 'pointer' }}>
        <Icon name="bell" color="#C8D0D8" size={15} />
        <div style={{ position: 'absolute', top: '-3px', right: '-3px', minWidth: '15px', height: '15px', padding: '0 3px', background: '#8A2020', border: '1.5px solid #0A0A0B', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: '9px', fontWeight: 600, color: '#F87171' }}>7</div>
      </div>

      <div style={{ width: '10px' }} />

      {/* User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
        <div style={{ width: '30px', height: '30px', borderRadius: '7px', background: 'linear-gradient(135deg,#2a2a30,#18181C)', border: '1px solid #33333a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '12px', color: '#E2E8ED' }}>RK</div>
        <div className="ss-hide-mobile" style={{ lineHeight: 1.25 }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#E2E8ED' }}>Rakesh Kothari</div>
          <div style={{ fontSize: '10px', color: '#8A9099', letterSpacing: '.04em' }}>OWNER</div>
        </div>
      </div>
    </div>
  );
}
