import { useState, useRef, useEffect } from 'react';

const COUNTRIES = [
    { code: '+91', iso: 'in', name: 'India', len: 10 },
    { code: '+1', iso: 'us', name: 'United States', len: 10 },
    { code: '+44', iso: 'gb', name: 'United Kingdom', len: 10 },
    { code: '+971', iso: 'ae', name: 'UAE', len: 9 },
    { code: '+61', iso: 'au', name: 'Australia', len: 9 },
    { code: '+1', iso: 'ca', name: 'Canada', len: 10 },
    { code: '+65', iso: 'sg', name: 'Singapore', len: 8 },
    { code: '+92', iso: 'pk', name: 'Pakistan', len: 10 },
    { code: '+880', iso: 'bd', name: 'Bangladesh', len: 10 },
    { code: '+977', iso: 'np', name: 'Nepal', len: 10 },
    { code: '+94', iso: 'lk', name: 'Sri Lanka', len: 9 },
    { code: '+49', iso: 'de', name: 'Germany', len: 11 },
    { code: '+33', iso: 'fr', name: 'France', len: 9 },
    { code: '+81', iso: 'jp', name: 'Japan', len: 10 },
    { code: '+86', iso: 'cn', name: 'China', len: 11 },
    { code: '+60', iso: 'my', name: 'Malaysia', len: 9 },
];

const flagUrl = (iso) => `https://flagcdn.com/w40/${iso}.png`;
const DEFAULT_COUNTRY = COUNTRIES.find((c) => c.iso === 'us');

export default function PhoneInput({ value = '', onChange, required, name = 'phone' }) {
    const parseInitial = () => {
        const sorted = [...COUNTRIES].sort((a, b) => b.code.length - a.code.length);
        const match = sorted.find((c) => value.startsWith(c.code));
        if (match) return { country: match, number: value.slice(match.code.length).replace(/\D/g, '') };
        return { country: DEFAULT_COUNTRY, number: value.replace(/\D/g, '') };
    };

    const [country, setCountry] = useState(parseInitial().country);
    const [number, setNumber] = useState(parseInitial().number);
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);

    useEffect(() => {
        const onClick = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    const propagate = (c, n) => onChange?.({ target: { name, value: n ? `${c.code} ${n}` : '' } });

    const handleNumber = (e) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, country.len);
        setNumber(digits);
        propagate(country, digits);
    };

    const selectCountry = (c) => {
        setCountry(c);
        setOpen(false);
        const trimmed = number.slice(0, c.len);
        setNumber(trimmed);
        propagate(c, trimmed);
    };

    const isValid = number.length === 0 || number.length === country.len;

    return (
        <div ref={wrapRef} style={{ position: 'relative' }}>
            <div style={{
                display: 'flex', alignItems: 'stretch',
                border: `1.5px solid ${isValid ? 'var(--border)' : 'var(--terra)'}`,
                background: 'var(--paper)',
                borderRadius: 999,
                overflow: 'hidden',
                height: 50,
            }}>
                <button type="button" onClick={() => setOpen((o) => !o)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 16px',
                    borderRight: '1px solid var(--border)', background: 'var(--bg-2)',
                    color: 'var(--ink)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                }}>
                    <img src={flagUrl(country.iso)} alt="" width={22} height={16} />
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>{country.code}</span>
                    <i className="fas fa-chevron-down" style={{ fontSize: 9, opacity: 0.5 }}></i>
                </button>
                <input
                    type="tel" name={name} value={number} onChange={handleNumber}
                    placeholder={`${country.len}-digit number`}
                    required={required}
                    pattern={`\\d{${country.len}}`}
                    maxLength={country.len}
                    inputMode="numeric"
                    style={{ flex: 1, border: 'none', borderRadius: 0, padding: '0 18px', fontSize: 15, background: 'transparent' }}
                />
            </div>
            {!isValid && (
                <p style={{ fontSize: 11, color: 'var(--terra)', marginTop: 6, fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1, textTransform: 'uppercase' }}>
                    Enter exactly {country.len} digits for {country.name}
                </p>
            )}
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                    background: 'var(--paper)', border: '1.5px solid var(--border)',
                    boxShadow: 'var(--shadow)',
                    maxHeight: 280, overflowY: 'auto', borderRadius: 12, zIndex: 50,
                }}>
                    {COUNTRIES.map((c, i) => (
                        <button key={i} type="button" onClick={() => selectCountry(c)} style={{
                            width: '100%', display: 'grid', gridTemplateColumns: '24px 1fr auto',
                            alignItems: 'center', gap: 12, padding: '11px 16px',
                            background: country.iso === c.iso ? 'var(--bg-2)' : 'transparent',
                            color: 'var(--ink)', fontSize: 13.5, textAlign: 'left',
                            borderBottom: '1px solid var(--border)',
                        }}>
                            <img src={flagUrl(c.iso)} alt="" width={22} height={16} loading="lazy" />
                            <span>{c.name}</span>
                            <span style={{ color: 'var(--ink-3)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{c.code}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
