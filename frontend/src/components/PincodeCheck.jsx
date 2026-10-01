import { useEffect, useState } from 'react';
import { checkPincode } from '../api/store';
import { errorMessage } from '../api/axios';

const SAVED = 'hv_pincode';

/** Pincode box used on the product page and at checkout. Each pincode is checked once and remembered. */
export default function PincodeCheck({ onResult, compact = false, initial }) {
    const [pin, setPin] = useState(() => initial || localStorage.getItem(SAVED) || '');
    const [res, setRes] = useState(null);
    const [busy, setBusy] = useState(false);

    const check = async () => {
        if (!/^\d{6}$/.test(pin)) { setRes({ ok: false, message: 'Enter a 6-digit pincode.' }); onResult?.(null); return; }
        setBusy(true);
        try {
            const r = await checkPincode(pin);
            setRes(r);
            if (r.ok) localStorage.setItem(SAVED, pin);
            onResult?.(r.ok ? r : null);
        } catch (err) {
            setRes({ ok: false, message: errorMessage(err, 'Could not check this pincode') });
            onResult?.(null);
        } finally {
            setBusy(false);
        }
    };

    // A pincode saved from an earlier visit is checked once automatically (cached, so no repeat calls).
    useEffect(() => {
        if (/^\d{6}$/.test(pin)) check();
         
    }, []);

    return (
        <div className={`pin-check ${compact ? 'compact' : ''}`}>
            {/* A div, not a form: this box also sits inside the checkout form, and forms cannot nest. */}
            <div className="pin-row">
                <i className="fas fa-location-dot"></i>
                <input
                    inputMode="numeric" maxLength={6} placeholder="Delivery pincode" aria-label="Delivery pincode"
                    value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setRes(null); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); check(); } }}
                />
                <button type="button" className="pin-btn" onClick={check} disabled={busy}>{busy ? 'Checking…' : 'Check'}</button>
            </div>
            {res && (
                <p className={`pin-msg ${res.ok ? 'ok' : 'bad'}`}>
                    {res.ok
                        ? <><i className="fas fa-circle-check"></i> We deliver to {res.city}. Earliest: {res.days[0].label}</>
                        : <><i className="fas fa-circle-xmark"></i> {res.message}</>}
                </p>
            )}
        </div>
    );
}
