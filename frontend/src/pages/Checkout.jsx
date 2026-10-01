import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errorMessage } from '../api/axios';
import { keys, getOffers, invalidateCatalog } from '../api/store';
import { useCached } from '../hooks/useCached';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import PhoneInput from '../components/PhoneInput.jsx';
import PincodeCheck from '../components/PincodeCheck.jsx';

const money = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

// Same rules as the server, used only for the preview before a coupon is applied.
function estimate(subtotal) {
    const shipping = subtotal >= 999 ? 0 : 49;
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    return { subtotal, discount: 0, shipping, tax, total: Math.round((subtotal + shipping + tax) * 100) / 100 };
}

export default function Checkout() {
    const { items, subtotal, clear } = useCart();
    const { user } = useAuth();
    const { data: offers } = useCached(keys.offers, getOffers);

    const [form, setForm] = useState({
        customerName: user?.name || '', customerPhone: user?.phone || '', customerEmail: user?.email || '',
        line1: '', line2: '', city: '', state: '', notes: '',
    });
    const [delivery, setDelivery] = useState(null); // pincode result with days
    const [slot, setSlot] = useState(null); // { date, window }
    const [code, setCode] = useState('');
    const [applied, setApplied] = useState(null); // { key, quote }
    const [applying, setApplying] = useState(false);
    const [placing, setPlacing] = useState(false);
    const [placed, setPlaced] = useState(null);

    const lineItems = useMemo(() => items.map((i) => ({ product: i._id, quantity: i.quantity })), [items]);
    const bagKey = JSON.stringify(lineItems);
    const quote = applied?.key === bagKey ? applied.quote : null; // a changed bag needs the coupon re-applied
    const totals = quote || estimate(subtotal);

    useEffect(() => {
        if (delivery?.city) setForm((f) => (f.city ? f : { ...f, city: delivery.city }));
    }, [delivery]);

    const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const applyCoupon = async (c = code) => {
        const value = c.trim().toUpperCase();
        if (!value) return;
        setApplying(true);
        try {
            const { data } = await api.post('/orders/quote', { items: lineItems, couponCode: value });
            setApplied({ key: bagKey, quote: data });
            setCode(value);
            toast.success(`${value} applied: you save ${money(data.discount)}`);
        } catch (err) {
            toast.error(errorMessage(err, 'Could not apply that coupon'));
        } finally {
            setApplying(false);
        }
    };

    const removeCoupon = () => { setApplied(null); setCode(''); };

    const submit = async (e) => {
        e.preventDefault();
        if (!delivery) return toast.error('Check your pincode to see delivery slots');
        if (!slot) return toast.error('Please pick a delivery slot');
        setPlacing(true);
        try {
            const { data } = await api.post('/orders', {
                customerName: form.customerName,
                customerPhone: form.customerPhone,
                customerEmail: form.customerEmail,
                shippingAddress: { line1: form.line1, line2: form.line2, city: form.city, state: form.state, pincode: delivery.pincode },
                items: lineItems,
                couponCode: quote?.coupon?.code,
                deliverySlot: slot,
                notes: form.notes,
            });
            invalidateCatalog(); // stock changed
            clear();
            setPlaced(data);
            window.scrollTo({ top: 0 });
        } catch (err) {
            toast.error(errorMessage(err, 'Could not place your order'));
        } finally {
            setPlacing(false);
        }
    };

    if (placed) {
        return (
            <section className="checkout-page">
                <div className="container" style={{ maxWidth: 680 }}>
                    <div className="placed-card">
                        <div className="placed-icon"><i className="fas fa-check"></i></div>
                        <div className="label-mono">Order #{placed._id.slice(-8).toUpperCase()}</div>
                        <h1>Thank you, {placed.customerName.split(' ')[0]}!</h1>
                        <p>Your basket is being picked fresh. We will deliver it on <strong>{placed.deliverySlot.label}</strong>.</p>
                        <div className="placed-total"><span>Pay on delivery (cash or UPI)</span><strong>{money(placed.total)}</strong></div>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                            {user ? <Link to="/orders" className="btn btn-primary">View my orders</Link> : <Link to="/register" className="btn btn-primary">Create an account to track orders</Link>}
                            <Link to="/shop" className="btn btn-outline">Keep shopping</Link>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (items.length === 0) {
        return (
            <section className="checkout-page" style={{ display: 'grid', placeItems: 'center' }}>
                <div className="empty-card">
                    <i className="fas fa-bag-shopping"></i>
                    <h3>Your bag is empty</h3>
                    <p>Discover something fresh.</p>
                    <Link to="/shop" className="btn btn-primary">Browse Shop</Link>
                </div>
            </section>
        );
    }

    return (
        <section className="checkout-page">
            <div className="container">
                <div className="label-mono">Checkout</div>
                <h1 className="checkout-title">Almost <em>there.</em></h1>

                <div className="checkout-grid">
                    <form onSubmit={submit} className="checkout-form">
                        <h3>1. Delivery slot</h3>
                        <PincodeCheck onResult={(r) => { setDelivery(r); setSlot(null); }} />
                        {delivery && (
                            <div className="slot-picker">
                                {delivery.days.map((d) => (
                                    <div key={d.date} className="slot-day">
                                        <div className="slot-date">{d.label}</div>
                                        {d.windows.map((w) => {
                                            const on = slot?.date === d.date && slot?.window === w.id;
                                            return (
                                                <button type="button" key={w.id} className={`slot ${on ? 'on' : ''}`} onClick={() => setSlot({ date: d.date, window: w.id })} aria-pressed={on}>
                                                    {w.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        )}

                        <h3 style={{ marginTop: 28 }}>2. Your details</h3>
                        <div className="row-2">
                            <div className="field"><label>Full name *</label><input name="customerName" value={form.customerName} onChange={onChange} required autoComplete="name" /></div>
                            <div className="field"><label>Phone *</label><PhoneInput name="customerPhone" value={form.customerPhone} onChange={onChange} required /></div>
                        </div>
                        <div className="field"><label>Email</label><input name="customerEmail" type="email" value={form.customerEmail} onChange={onChange} autoComplete="email" /></div>

                        <h3 style={{ marginTop: 28 }}>3. Address</h3>
                        <div className="field"><label>House / street *</label><input name="line1" value={form.line1} onChange={onChange} required autoComplete="address-line1" /></div>
                        <div className="field"><label>Landmark / area</label><input name="line2" value={form.line2} onChange={onChange} autoComplete="address-line2" /></div>
                        <div className="row-2">
                            <div className="field"><label>City *</label><input name="city" value={form.city} onChange={onChange} required autoComplete="address-level2" /></div>
                            <div className="field"><label>State *</label><input name="state" value={form.state} onChange={onChange} required autoComplete="address-level1" /></div>
                        </div>
                        <div className="field"><label>Delivery notes</label><textarea name="notes" value={form.notes} onChange={onChange} maxLength={500} placeholder="Gate code, leave with security…" /></div>

                        <div className="pay-note">
                            <i className="fas fa-hand-holding-dollar"></i>
                            <div><strong>Pay on delivery</strong><span>Cash or UPI when your basket arrives. No card needed.</span></div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={placing} style={{ marginTop: 18 }}>
                            {placing ? 'Placing order…' : `Place order · ${money(totals.total)}`}
                        </button>
                    </form>

                    <aside className="checkout-summary-card">
                        <h3>Order summary</h3>
                        <div className="sum-items">
                            {items.map((it) => (
                                <div key={it._id} className="sum-item">
                                    <img src={it.image} alt="" />
                                    <div><strong>{it.name}</strong><span>×{it.quantity} · {it.unit}</span></div>
                                    <b>{money(it.price * it.quantity)}</b>
                                </div>
                            ))}
                        </div>

                        {quote?.coupon ? (
                            <div className="coupon-applied">
                                <i className="fas fa-tag"></i>
                                <div><strong>{quote.coupon.code}</strong><span>{quote.coupon.description}</span></div>
                                <button type="button" onClick={removeCoupon}>Remove</button>
                            </div>
                        ) : (
                            <>
                                <form className="coupon-row" onSubmit={(e) => { e.preventDefault(); applyCoupon(); }}>
                                    <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Coupon code" aria-label="Coupon code" />
                                    <button className="btn btn-outline btn-sm" disabled={applying || !code.trim()}>{applying ? '…' : 'Apply'}</button>
                                </form>
                                {offers?.length > 0 && (
                                    <div className="offers">
                                        {offers.map((o) => (
                                            <button type="button" key={o.code} className="offer" onClick={() => applyCoupon(o.code)} disabled={applying}>
                                                <strong>{o.code}</strong><span>{o.description}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        <div className="sum-row"><span>Subtotal</span><span>{money(totals.subtotal)}</span></div>
                        {totals.discount > 0 && <div className="sum-row save"><span>Coupon discount</span><span>−{money(totals.discount)}</span></div>}
                        <div className="sum-row"><span>Delivery</span><span>{totals.shipping === 0 ? 'Free' : money(totals.shipping)}</span></div>
                        <div className="sum-row"><span>GST (5%)</span><span>{money(totals.tax)}</span></div>
                        <div className="sum-total"><span>Total</span><strong>{money(totals.total)}</strong></div>
                        {totals.shipping > 0 && <p className="sum-hint">Free delivery on orders above ₹999.</p>}
                        {slot && delivery && <p className="sum-hint"><i className="fas fa-truck"></i> {delivery.days.find((d) => d.date === slot.date)?.label}, {delivery.days[0].windows.find((w) => w.id === slot.window)?.label}</p>}
                    </aside>
                </div>
            </div>
        </section>
    );
}
