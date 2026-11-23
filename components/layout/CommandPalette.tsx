'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useOrderStore } from '@/stores/useOrderStore';
import { useClientStore } from '@/stores/useClientStore';
import { useBillingStore } from '@/stores/useBillingStore';
import { useInventoryStore } from '@/stores/useInventoryStore';
import Icon from '@/components/ui/Icon';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PaletteItem {
  id: string;
  category: 'Pages' | 'Orders' | 'Clients' | 'Invoices' | 'Vault SKUs';
  title: string;
  subtitle: string;
  href: string;
  icon?: string;
  tag?: string;
}

const STATIC_PAGES: PaletteItem[] = [
  { id: 'page-dash', category: 'Pages', title: 'Dashboard', subtitle: 'Live executive command center', href: '/', icon: 'grid' },
  { id: 'page-ord', category: 'Pages', title: 'Orders Engine', subtitle: 'Create, track and manage jewellery orders', href: '/orders', icon: 'orders' },
  { id: 'page-prod', category: 'Pages', title: 'Production Floor', subtitle: 'Kanban board & 5-stage manufacturing', href: '/production', icon: 'production' },
  { id: 'page-out', category: 'Pages', title: 'Outsourcing Floor', subtitle: 'Karigar jobs & loss recovery audit', href: '/outsourcing', icon: 'outsourcing' },
  { id: 'page-cli', category: 'Pages', title: 'Clients & Vendors', subtitle: 'Customer directory & running balances', href: '/clients', icon: 'clients' },
  { id: 'page-kar', category: 'Pages', title: 'Karigar Directory', subtitle: 'Artisan capacity & risk matrix', href: '/karigar', icon: 'people' },
  { id: 'page-bil', category: 'Pages', title: 'Billing & Invoicing', subtitle: 'GST-ready invoices with rate locks', href: '/billing', icon: 'billing' },
  { id: 'page-led', category: 'Pages', title: 'Silver Ledger', subtitle: 'Dual running silver & INR balances', href: '/ledger', icon: 'ledger' },
  { id: 'page-ws', category: 'Pages', title: 'Where Is My Silver?', subtitle: 'Vault balances & batch genealogy tree', href: '/wheresilver', icon: 'diamond' },
  { id: 'page-inv', category: 'Pages', title: 'Inventory & Vaults', subtitle: 'Stock by SKU and safe vault locations', href: '/inventory', icon: 'inventory' },
  { id: 'page-mov', category: 'Pages', title: 'Material Movement', subtitle: 'Log silver issue, receipts & transfers', href: '/movement', icon: 'movement' },
  { id: 'page-fin', category: 'Pages', title: 'Finance & Accounts', subtitle: 'Receivables aging & operating expenses', href: '/finance', icon: 'finance' },
  { id: 'page-an', category: 'Pages', title: 'Analytics', subtitle: 'Revenue, margin & product category mix', href: '/analytics', icon: 'analytics' },
  { id: 'page-rep', category: 'Pages', title: 'Reports & Export Hub', subtitle: 'Generate metal position & GST CSVs', href: '/reports', icon: 'reports' },
  { id: 'page-mas', category: 'Pages', title: 'Master Data', subtitle: 'Jewellery categories, purity & making charges', href: '/master', icon: 'master' },
  { id: 'page-set', category: 'Pages', title: 'Company Settings', subtitle: 'Entity details, GSTIN & spot silver rate', href: '/settings', icon: 'settings' },
  { id: 'page-emp', category: 'Pages', title: 'Employees', subtitle: 'Staff roster & daily attendance', href: '/employees', icon: 'people' },
];

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const { orders } = useOrderStore();
  const { clients } = useClientStore();
  const { invoices } = useBillingStore();
  const { items } = useInventoryStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard shortcut listener for Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Build searchable entity items
  const dynamicItems: PaletteItem[] = [
    ...STATIC_PAGES,
    ...orders.map((o) => ({
      id: `ord-${o.id}`,
      category: 'Orders' as const,
      title: `${o.no} · ${o.client}`,
      subtitle: `${o.products} · ${Number(o.fine).toFixed(3)}g fine · ${o.status.toUpperCase()}`,
      href: `/orders/${o.no}`,
      tag: o.status,
    })),
    ...clients.map((c) => ({
      id: `cli-${c.id}`,
      category: 'Clients' as const,
      title: c.name,
      subtitle: `${c.city} · Out: ₹ ${(c.inrOut || 0).toLocaleString('en-IN')}`,
      href: `/clients`,
      tag: c.clientCode,
    })),
    ...invoices.map((iv) => ({
      id: `inv-${iv.id}`,
      category: 'Invoices' as const,
      title: `${iv.no} · ${iv.client}`,
      subtitle: `Total: ₹ ${(iv.grandTotal || 0).toLocaleString('en-IN')} · ${iv.status.toUpperCase()}`,
      href: `/billing`,
      tag: iv.status,
    })),
    ...items.map((it) => ({
      id: `item-${it.id}`,
      category: 'Vault SKUs' as const,
      title: `${it.sku} · ${it.cat}`,
      subtitle: `${it.loc} · ${it.pieces} pcs (${Number(it.fine).toFixed(3)}g fine)`,
      href: `/inventory`,
      tag: it.status,
    })),
  ];

  const q = query.toLowerCase().trim();
  const filtered = q
    ? dynamicItems.filter(
        (it) =>
          it.title.toLowerCase().includes(q) ||
          it.subtitle.toLowerCase().includes(q) ||
          it.category.toLowerCase().includes(q) ||
          (it.tag && it.tag.toLowerCase().includes(q))
      )
    : dynamicItems.slice(0, 15);

  const handleSelect = (item: PaletteItem) => {
    onClose();
    router.push(item.href);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex]);
      }
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 200,
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '92%',
          maxWidth: '580px',
          background: '#111113',
          border: '1px solid #33333a',
          borderRadius: '12px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
          zIndex: 210,
          overflow: 'hidden',
          animation: 'ssFade 0.15s ease-out',
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            borderBottom: '1px solid #242428',
            background: '#141418',
          }}
        >
          <Icon name="search" color="#8A9099" size={17} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Search orders, clients, invoices, vaults or jump to page..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              color: '#F0F2F4',
              fontFamily: 'inherit',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8A9099',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              ×
            </button>
          )}
          <kbd
            style={{
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: '10px',
              background: '#1C1C20',
              border: '1px solid #28282E',
              borderRadius: '4px',
              padding: '2px 6px',
              color: '#8A9099',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          style={{
            maxHeight: '380px',
            overflowY: 'auto',
            padding: '8px',
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: '#8A9099', fontSize: '13px' }}>
              No matching records found for &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    background: isSelected ? '#1C1C22' : 'transparent',
                    border: isSelected ? '1px solid #2E2E36' : '1px solid transparent',
                    transition: 'background 0.08s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <span
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        background: '#18181C',
                        border: '1px solid #242428',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon name={item.icon || 'diamond'} color="#8A9099" size={13} />
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#F0F2F4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#8A9099', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: '#8A9099',
                        background: '#18181C',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {item.category}
                    </span>
                    {isSelected && (
                      <span style={{ fontSize: '11px', color: '#60A5FA', fontFamily: "'JetBrains Mono',monospace" }}>
                        ↵
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '9px 16px',
            borderTop: '1px solid #1C1C20',
            background: '#0D0D0F',
            fontSize: '11px',
            color: '#5A5A62',
          }}
        >
          <div style={{ display: 'flex', gap: '14px' }}>
            <span><kbd style={{ color: '#8A9099' }}>↑↓</kbd> Navigate</span>
            <span><kbd style={{ color: '#8A9099' }}>↵</kbd> Select</span>
            <span><kbd style={{ color: '#8A9099' }}>esc</kbd> Dismiss</span>
          </div>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px' }}>SilverSuite v1.0</span>
        </div>
      </div>
    </>
  );
}
