'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store/AppContext';
import Icon from '@/components/ui/Icon';

const navDefs = [
  { label: 'OPERATIONS', items: [
    { id: 'dashboard', name: 'Dashboard', icon: 'grid', href: '/' },
    { id: 'orders', name: 'Orders', icon: 'orders', href: '/orders' },
    { id: 'production', name: 'Production', icon: 'production', href: '/production' },
    { id: 'outsourcing', name: 'Outsourcing', icon: 'outsourcing', href: '/outsourcing', badge: '3' },
  ]},
  { label: 'CLIENTS', items: [
    { id: 'clients', name: 'Clients / Vendors', icon: 'clients', href: '/clients' },
    { id: 'karigar', name: 'Karigar', icon: 'people', href: '/karigar' },
  ]},
  { label: 'FINANCE', items: [
    { id: 'billing', name: 'Billing', icon: 'billing', href: '/billing' },
    { id: 'ledger', name: 'Silver Ledger', icon: 'ledger', href: '/ledger' },
    { id: 'finance', name: 'Finance & Accounts', icon: 'finance', href: '/finance' },
  ]},
  { label: 'WAREHOUSE', items: [
    { id: 'wheresilver', name: 'Where Is My Silver?', icon: 'diamond', href: '/wheresilver' },
    { id: 'inventory', name: 'Inventory', icon: 'inventory', href: '/inventory' },
    { id: 'movement', name: 'Material Movement', icon: 'movement', href: '/movement' },
  ]},
  { label: 'PEOPLE', items: [
    { id: 'employees', name: 'Employees', icon: 'people', href: '/employees' },
  ]},
  { label: 'INTELLIGENCE', items: [
    { id: 'reports', name: 'Reports', icon: 'reports', href: '/reports' },
    { id: 'analytics', name: 'Analytics', icon: 'analytics', href: '/analytics' },
  ]},
  { label: 'SYSTEM', items: [
    { id: 'settings', name: 'Settings', icon: 'settings', href: '/settings' },
    { id: 'master', name: 'Master Data', icon: 'master', href: '/master' },
  ]},
];

export default function Sidebar() {
  const { sidebarExpanded, toggleSidebar, mobileSidebarOpen, closeMobileSidebar } = useApp();
  const pathname = usePathname();
  const width = sidebarExpanded ? '206px' : '48px';

  function isActive(href: string, id: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  const renderContent = (expanded: boolean, onLinkClick?: () => void) => {
    return navDefs.map(group => (
      <div key={group.label} style={{ marginBottom: '10px' }}>
        {expanded && (
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.13em', color: '#5a5a62', padding: '6px 10px 4px' }}>{group.label}</div>
        )}
        {group.items.map(item => {
          const active = isActive(item.href, item.id);
          return (
            <Link key={item.id} href={item.href} onClick={onLinkClick} style={{
              display: 'flex', alignItems: 'center', gap: '10px', height: '33px',
              padding: expanded ? '0 10px' : '0 15px', borderRadius: '6px', cursor: 'pointer',
              fontSize: '13px', whiteSpace: 'nowrap', transition: 'background .08s',
              color: active ? '#E2E8ED' : '#8A9099',
              background: active ? '#18181C' : 'transparent',
              borderLeft: active ? '2px solid #C8D0D8' : '2px solid transparent',
              marginLeft: '-2px', fontWeight: active ? 500 : 400, textDecoration: 'none',
            }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#18181C'; e.currentTarget.style.color = '#C8D0D8'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8A9099'; } }}>
              <span style={{ width: '18px', height: '18px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={item.icon} color={active ? '#E2E8ED' : '#8A9099'} size={17} />
              </span>
              {expanded && (
                <>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{item.name}</span>
                  {(item as { badge?: string }).badge && (
                    <span style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', fontWeight: 600, color: '#F87171', background: 'rgba(138,32,32,.2)', borderRadius: '4px', padding: '0 5px' }}>
                      {(item as { badge?: string }).badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </div>
    ));
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="ss-sidebar-desktop" style={{ flexShrink: 0, background: '#0C0C0D', borderRight: '1px solid #242428', flexDirection: 'column', padding: '10px 8px', overflowY: 'auto', overflowX: 'hidden', transition: 'width .14s ease', width }}>
        {renderContent(sidebarExpanded)}

        {/* Collapse button */}
        <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
          <button onClick={toggleSidebar} style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '30px', padding: '0 12px', borderRadius: '6px', cursor: 'pointer', color: '#5a5a62', fontSize: '12px', background: 'transparent', border: 'none', width: '100%' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#18181C'; e.currentTarget.style.color = '#8A9099'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5a5a62'; }}>
            <span style={{ width: '18px', flexShrink: 0 }}>
              <Icon name={sidebarExpanded ? 'collapse' : 'expand'} color="#5a5a62" size={17} />
            </span>
            {sidebarExpanded && <span>Collapse</span>}
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Sidebar Drawer */}
      {mobileSidebarOpen && (
        <>
          <div className="ss-nav-overlay" onClick={closeMobileSidebar} />
          <div className="ss-sidebar-mobile" style={{ background: '#0C0C0D', borderRight: '1px solid #242428', display: 'flex', flexDirection: 'column', padding: '12px 10px', overflowY: 'auto', overflowX: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '0 6px' }}>
              <div style={{ fontWeight: 700, letterSpacing: '.14em', fontSize: '13px', color: '#F0F2F4' }}>
                SILVER<span style={{ color: '#8A9099', fontWeight: 500 }}>SUITE</span>
              </div>
              <button onClick={closeMobileSidebar} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8A9099', padding: '4px' }}>
                <Icon name="x" color="#8A9099" size={16} />
              </button>
            </div>
            {renderContent(true, closeMobileSidebar)}
          </div>
        </>
      )}
    </>
  );
}
