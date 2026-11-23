'use client';
import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useUIStore } from '@/stores/useUIStore';

const settingsTabs = [
  { id: 'company', label: 'Company Profile' },
  { id: 'silver', label: 'Silver Rate' },
  { id: 'tax', label: 'Tax & GST' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'integrations', label: 'Integrations' },
];

export default function SettingsPage() {
  const { settingsTab, setSettingsTab, profile, isLoading, fetchProfile, updateProfile, updateMcxRate } =
    useSettingsStore();
  const showToast = useUIStore((s) => s.showToast);

  const [formName, setFormName] = useState('');
  const [formProprietor, setFormProprietor] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formGst, setFormGst] = useState('');
  const [formUdyam, setFormUdyam] = useState('');
  const [mcxRateInput, setMcxRateInput] = useState(89000);
  const [autoBills, setAutoBills] = useState(true);
  const [twoFA, setTwoFA] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setFormName(profile.name);
      setFormProprietor(profile.proprietor);
      setFormLocation(profile.location);
      setFormGst(profile.gstNumber);
      setFormUdyam(profile.udyamNumber);
      setMcxRateInput(profile.mcxRateBase || 89000);
      setAutoBills(profile.autoBills);
      setTwoFA(profile.twoFactorAuth);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    const res = await updateProfile({
      name: formName,
      proprietor: formProprietor,
      location: formLocation,
      gstNumber: formGst,
      udyamNumber: formUdyam,
      mcxRateBase: Number(mcxRateInput),
      autoBills,
      twoFactorAuth: twoFA,
    });
    if (res.success) {
      showToast('Company profile settings saved successfully');
    } else {
      showToast(res.error || 'Failed to save company profile');
    }
  };

  const handleSaveMcxRate = async () => {
    const res = await updateMcxRate(Number(mcxRateInput));
    if (res.success) {
      showToast(`MCX Base rate updated to ₹ ${Number(mcxRateInput).toLocaleString('en-IN')}`);
    } else {
      showToast(res.error || 'Failed to update MCX rate');
    }
  };

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <div
      onClick={onToggle}
      style={{
        width: '38px',
        height: '20px',
        borderRadius: '10px',
        background: on ? '#C8D0D8' : '#242428',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background .15s',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '3px',
          left: on ? '21px' : '3px',
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          background: on ? '#0A0A0B' : '#8A9099',
          transition: 'left .15s',
        }}
      />
    </div>
  );

  const inputStyle: React.CSSProperties = {
    height: '34px',
    background: '#18181C',
    border: '1px solid #242428',
    borderRadius: '6px',
    padding: '0 10px',
    color: '#F0F2F4',
    fontSize: '13px',
    outline: 'none',
    width: '100%',
    maxWidth: '360px',
  };

  return (
    <div className="ss-settings">
      {/* Left nav */}
      <div className="ss-settings-nav-container">
        <div
          style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', color: '#5a5a62', padding: '0 8px 10px' }}
          className="ss-hide-mobile"
        >
          Settings
        </div>
        <div className="ss-settings-nav">
          {settingsTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setSettingsTab(t.id)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '9px 10px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: settingsTab === t.id ? 500 : 400,
                color: settingsTab === t.id ? '#E2E8ED' : '#8A9099',
                background: settingsTab === t.id ? '#18181C' : 'transparent',
                border: settingsTab === t.id ? '1px solid #242428' : '1px solid transparent',
                cursor: 'pointer',
                marginBottom: '2px',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ss-settings-content">
        {settingsTab === 'company' && (
          <>
            <div style={{ fontSize: '18px', fontWeight: 600, color: '#F0F2F4', marginBottom: '20px' }}>
              Company Profile
            </div>
            <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#8A9099' }}>Company Legal Name</span>
                  <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#8A9099' }}>Proprietor / Director</span>
                  <input type="text" value={formProprietor} onChange={(e) => setFormProprietor(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#8A9099' }}>Unit Location</span>
                  <input type="text" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#8A9099' }}>GST Number</span>
                  <input type="text" value={formGst} onChange={(e) => setFormGst(e.target.value)} style={{ ...inputStyle, fontFamily: "'JetBrains Mono',monospace" }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#8A9099' }}>MSME / Udyam ID</span>
                  <input type="text" value={formUdyam} onChange={(e) => setFormUdyam(e.target.value)} style={{ ...inputStyle, fontFamily: "'JetBrains Mono',monospace" }} />
                </div>
              </div>
              <button
                onClick={handleSaveProfile}
                style={{
                  marginTop: '20px',
                  height: '34px',
                  padding: '0 20px',
                  background: '#C8D0D8',
                  color: '#0A0A0B',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                Save Changes
              </button>
            </div>
          </>
        )}

        {settingsTab === 'silver' && (
          <>
            <div style={{ fontSize: '18px', fontWeight: 600, color: '#F0F2F4', marginBottom: '20px' }}>
              MCX Silver Spot Rate Configuration
            </div>
            <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '20px' }}>
              <div style={{ fontSize: '13px', color: '#8A9099', marginBottom: '14px' }}>
                Base market rate applied across new order valuations and rate locks.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', color: '#F0F2F4' }}>Spot Rate (₹ / kg):</span>
                <input
                  type="number"
                  value={mcxRateInput}
                  onChange={(e) => setMcxRateInput(parseFloat(e.target.value) || 0)}
                  style={{ ...inputStyle, maxWidth: '200px', fontFamily: "'JetBrains Mono',monospace" }}
                />
              </div>
              <button
                onClick={handleSaveMcxRate}
                style={{
                  height: '34px',
                  padding: '0 20px',
                  background: '#C8D0D8',
                  color: '#0A0A0B',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                Update Silver Rate
              </button>
            </div>
          </>
        )}

        {settingsTab === 'tax' && (
          <>
            <div style={{ fontSize: '18px', fontWeight: 600, color: '#F0F2F4', marginBottom: '20px' }}>
              Tax &amp; GST Configuration
            </div>
            <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #1C1C20' }}>
                  <span style={{ fontSize: '13px', color: '#E2E8ED' }}>Jewellery GST Standard Rate</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", color: '#4ADE80', fontWeight: 600 }}>3.0%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #1C1C20' }}>
                  <span style={{ fontSize: '13px', color: '#E2E8ED' }}>Intra-State Split</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", color: '#C8D0D8' }}>1.5% CGST + 1.5% SGST</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #1C1C20' }}>
                  <span style={{ fontSize: '13px', color: '#E2E8ED' }}>Inter-State IGST</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", color: '#C8D0D8' }}>3.0% IGST</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: '#E2E8ED' }}>HSN Code</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", color: '#8A9099' }}>7113 (Silver Jewellery)</span>
                </div>
              </div>
            </div>
          </>
        )}

        {settingsTab === 'notifications' && (
          <>
            <div style={{ fontSize: '18px', fontWeight: 600, color: '#F0F2F4', marginBottom: '20px' }}>
              Notifications &amp; Security
            </div>
            <div style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '0 20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #1C1C20' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#E2E8ED' }}>Two-Factor Authentication</div>
                  <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '2px' }}>Require OTP verification on every login</div>
                </div>
                <Toggle on={twoFA} onToggle={() => setTwoFA(!twoFA)} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#E2E8ED' }}>Auto-generate Bills</div>
                  <div style={{ fontSize: '12px', color: '#8A9099', marginTop: '2px' }}>Create invoice automatically when order is dispatched</div>
                </div>
                <Toggle on={autoBills} onToggle={() => setAutoBills(!autoBills)} />
              </div>
            </div>
            <button
              onClick={handleSaveProfile}
              style={{
                height: '34px',
                padding: '0 20px',
                background: '#C8D0D8',
                color: '#0A0A0B',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
              }}
            >
              Save Security Preferences
            </button>
          </>
        )}

        {settingsTab === 'integrations' && (
          <>
            <div style={{ fontSize: '18px', fontWeight: 600, color: '#F0F2F4', marginBottom: '20px' }}>Integrations</div>
            <div className="ss-g3">
              {[
                { name: 'Tally Prime', desc: 'Export dual vouchers & receipts to Tally XML', connected: true },
                { name: 'MCX Cloud Feed', desc: 'Live spot rate sync API', connected: true },
                { name: 'WhatsApp Business', desc: 'Send order slips & invoice PDFs', connected: false },
                { name: 'GSTN Portal', desc: 'Direct GSTR-1 filing connector', connected: false },
              ].map((it) => (
                <div key={it.name} style={{ background: '#111113', border: '1px solid #242428', borderRadius: '8px', padding: '15px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#E2E8ED' }}>{it.name}</span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        height: '18px',
                        padding: '0 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 500,
                        background: it.connected ? 'rgba(45,125,82,.18)' : 'rgba(138,144,153,.14)',
                        color: it.connected ? '#4ADE80' : '#8A9099',
                      }}
                    >
                      {it.connected ? 'Connected' : 'Available'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#8A9099', marginBottom: '12px' }}>{it.desc}</div>
                  <button
                    onClick={() => showToast(it.connected ? `${it.name} verified and synced` : `${it.name} setup wizard opened`)}
                    style={{
                      height: '28px',
                      padding: '0 12px',
                      background: it.connected ? 'transparent' : '#C8D0D8',
                      color: it.connected ? '#8A9099' : '#0A0A0B',
                      border: it.connected ? '1px solid #242428' : 'none',
                      borderRadius: '5px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {it.connected ? 'Configured' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
