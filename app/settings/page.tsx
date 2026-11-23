'use client';
import React from 'react';
import { useApp } from '@/lib/store/AppContext';

const settingsTabs = [
  { id: 'company', label: 'Company Profile' }, { id: 'silver', label: 'Silver Rate' }, { id: 'tax', label: 'Tax & GST' },
  { id: 'users', label: 'Users & Roles' }, { id: 'notifications', label: 'Notifications' }, { id: 'integrations', label: 'Integrations' },
];

export default function SettingsPage() {
  const { settingsTab, setSettingsTab, notif, toggleNotif, twoFA, autoBills, toggleFlag, showToast } = useApp();

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <div onClick={onToggle} style={{ width: '38px', height: '20px', borderRadius: '10px', background: on ? '#C8D0D8' : '#242428', position: 'relative', cursor: 'pointer', transition: 'background .15s' }}>
      <div style={{ position: 'absolute', top: '3px', left: on ? '21px' : '3px', width: '14px', height: '14px', borderRadius: '50%', background: on ? '#0A0A0B' : '#8A9099', transition: 'left .15s' }} />
    </div>
  );

  return (
    <div className="ss-settings">
      {/* Left nav */}
      <div className="ss-settings-nav-container">
        <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', color: '#5a5a62', padding: '0 8px 10px' }} className="ss-hide-mobile">Settings</div>
        <div className="ss-settings-nav">
          {settingsTabs.map(t => (
            <button key={t.id} onClick={() => setSettingsTab(t.id)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: settingsTab === t.id ? 500 : 400, color: settingsTab === t.id ? '#E2E8ED' : '#8A9099', background: settingsTab === t.id ? '#18181C' : 'transparent', border: settingsTab === t.id ? '1px solid #242428' : '1px solid transparent', cursor: 'pointer', marginBottom: '2px' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ss-settings-content">
        {settingsTab === 'company' && (
          <>
            <div style={{ fontSize: '18px', fontWeight: 600, color: '#F0F2F4', marginBottom: '20px' }}>Company Profile</div>
            <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '20px' }}>
              {[['Company Name', 'Kothari Silver Industries Pvt. Ltd.'], ['Proprietor', 'Rakesh Kothari'], ['Unit Location', 'Surat, Gujarat'], ['GST Number', '24AABCK1234F1Z5'], ['MSME/Udyam', 'UDYAM-GJ-12-0012345']].map(([l, v]) => (
                <div key={l} className="ss-profile-row">
                  <span style={{ fontSize: '12px', color: '#8A9099' }}>{l}</span>
                  <span style={{ fontSize: '13px', color: '#E2E8ED', fontFamily: l.includes('GST') || l.includes('MSME') ? "'JetBrains Mono',monospace" : undefined }}>{v}</span>
                </div>
              ))}
              <button onClick={() => showToast('Company profile saved')} style={{ marginTop: '16px', height: '34px', padding: '0 20px', background: '#C8D0D8', color: '#0A0A0B', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', border: 'none' }}>Save Changes</button>
            </div>
          </>
        )}

        {settingsTab === 'notifications' && (
          <>
            <div style={{ fontSize: '18px', fontWeight: 600, color: '#F0F2F4', marginBottom: '20px' }}>Notifications</div>
            <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '0 20px' }}>
              {[
                { k: 'push', label: 'Push Notifications', desc: 'Browser & mobile push alerts' },
                { k: 'silver', label: 'MCX Silver Alerts', desc: 'Notify on ±2% rate change' },
                { k: 'overdue', label: 'Overdue Alerts', desc: 'Orders and job workers past due' },
                { k: 'daily', label: 'Daily Summary', desc: 'Morning digest email at 8 AM' },
              ].map(({ k, label, desc }) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #1C1C20' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: '#E2E8ED' }}>{label}</div>
                    <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '2px' }}>{desc}</div>
                  </div>
                  <Toggle on={notif[k as keyof typeof notif]} onToggle={() => toggleNotif(k as keyof typeof notif)} />
                </div>
              ))}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#E2E8ED', marginTop: '20px', marginBottom: '14px' }}>Security</div>
            <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '0 20px' }}>
              {[
                { k: 'twoFA', val: twoFA, label: 'Two-Factor Authentication', desc: 'Require OTP on every login' },
                { k: 'autoBills', val: autoBills, label: 'Auto-generate Bills', desc: 'Create invoice when order dispatched' },
              ].map(({ k, val, label, desc }) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #1C1C20' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: '#E2E8ED' }}>{label}</div>
                    <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '2px' }}>{desc}</div>
                  </div>
                  <Toggle on={val} onToggle={() => toggleFlag(k as 'twoFA' | 'autoBills')} />
                </div>
              ))}
            </div>
          </>
        )}

        {settingsTab === 'integrations' && (
          <>
            <div style={{ fontSize: '18px', fontWeight: 600, color: '#F0F2F4', marginBottom: '20px' }}>Integrations</div>
            <div className="ss-g3">
              {[
                { name: 'Tally Prime', desc: 'Export vouchers to Tally', connected: true },
                { name: 'MCX Feed', desc: 'Live silver rate API', connected: true },
                { name: 'WhatsApp', desc: 'Send invoices & alerts', connected: false },
                { name: 'Paytm PG', desc: 'Online payment collection', connected: false },
                { name: 'IndiaMART', desc: 'Lead & inquiry import', connected: false },
                { name: 'GSTN', desc: 'Direct GST filing', connected: false },
              ].map(it => (
                <div key={it.name} style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '15px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#E2E8ED' }}>{it.name}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', height: '18px', padding: '0 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 500, background: it.connected ? 'rgba(45,125,82,.18)' : 'rgba(138,144,153,.14)', color: it.connected ? '#4ADE80' : '#8A9099' }}>{it.connected ? 'Connected' : 'Not connected'}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#8A9099', marginBottom: '12px' }}>{it.desc}</div>
                  <button onClick={() => showToast(it.connected ? it.name + ' disconnected' : it.name + ' connected')} style={{ height: '28px', padding: '0 12px', background: it.connected ? 'transparent' : '#C8D0D8', color: it.connected ? '#8A9099' : '#0A0A0B', border: it.connected ? '1px solid #242428' : 'none', borderRadius: '5px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                    {it.connected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {!['company', 'notifications', 'integrations'].includes(settingsTab) && (
          <div style={{ color: '#5a5a62', padding: '48px', textAlign: 'center' }}>
            {settingsTabs.find(t => t.id === settingsTab)?.label} — coming soon
          </div>
        )}
      </div>
    </div>
  );
}
