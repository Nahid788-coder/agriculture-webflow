import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useMutation } from '../hooks/useFetch';
import PhoneInput from '../components/PhoneInput.jsx';

export default function Checkout() {
    const { items, subtotal, clear } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { mutate, loading } = useMutation('/orders');

    const [form, setForm] = useState({
        customerName: user?.name || '',
        customerPhone: user?.phone || '',
        customerEmail: user?.email || '',
        line1: '', line2: '', city: '', state: '', pincode: '',
        paymentMethod: 'cod',
        notes: '',
    });

    const shipping = subtotal >= 999 ? 0 : 49;
    const tax = +(subtotal * 0.05).toFixed(2);
    const total = +(subtotal + shipping + tax).toFixed(2);

    const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        if (!items.length) return toast.error('Cart is empty');
        try {
            await mutate({
                customerName: form.customerName,
                customerPhone: form.customerPhone,
                customerEmail: form.customerEmail,
                shippingAddress: {
                    line1: form.line1, line2: form.line2,
                    city: form.city, state: form.state, pincode: form.pincode,
                },
                items: items.map((i) => ({ product: i._id, name: i.name, image: i.image, price: i.price, unit: i.unit, quantity: i.quantity })),
                paymentMethod: form.paymentMethod,
                notes: form.notes,
            });
            toast.success('Order placed! Check email for tracking.');
            clear();
            navigate(user ? '/orders' : '/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Order failed');
        }
    };

    if (items.length === 0) {
        return (
            <section className="checkout-page" style={{ display: 'grid', placeItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <i className="fas fa-bag-shopping" style={{ fontSize: 56, color: 'var(--dim)', marginBottom: 18 }}></i>
                    <h2 style={{ fontSize: 36, fontFamily: 'Fraunces, serif', fontWeight: 400, marginBottom: 12 }}>Your bag is empty</h2>
                    <p style={{ color: 'var(--ink-3)', fontStyle: 'italic', fontFamily: 'Fraunces, serif', marginBottom: 24 }}>Discover something fresh.</p>
                    <Link to="/shop" className="btn btn-primary">Browse Shop</Link>
                </div>
            </section>
        );
    }

    return (
        <section className="checkout-page">
            <div className="container">
                <div className="label-mono">Checkout</div>
                <h1 style={{ fontSize: 'clamp(40px, 5vw, 76px)', fontFamily: 'Fraunces, serif', fontWeight: 400, letterSpacing: '-0.03em', marginTop: 18, marginBottom: 36 }}>
                    Almost <em>there.</em>
                </h1>

                <div className="checkout-grid">
                    <form onSubmit={submit} className="checkout-form">
                        <h3>Delivery Details</h3>

                        <div className="row-2">
                            <div className="field">
                                <label>Full Name *</label>
                                <input name="customerName" value={form.customerName} onChange={onChange} required />
                            </div>
                            <div className="field">
                                <label>Phone *</label>
                                <PhoneInput name="customerPhone" value={form.customerPhone} onChange={onChange} required />
                            </div>
                        </div>
                        <div className="field">
                            <label>Email</label>
                            <input name="customerEmail" type="email" value={form.customerEmail} onChange={onChange} />
                        </div>

                        <h3 style={{ marginTop: 24 }}>Shipping Address</h3>
                        <div className="field">
                            <label>Address Line 1 *</label>
                            <input name="line1" value={form.line1} onChange={onChange} required />
                        </div>
                        <div className="field">
                            <label>Address Line 2</label>
                            <input name="line2" value={form.line2} onChange={onChange} />
                        </div>
                        <div className="row-2">
                            <div className="field">
                                <label>City *</label>
                                <input name="city" value={form.city} onChange={onChange} required />
                            </div>
                            <div className="field">
                                <label>State *</label>
                                <input name="state" value={form.state} onChange={onChange} required />
                            </div>
                        </div>
                        <div className="field">
                            <label>Pincode *</label>
                            <input name="pincode" value={form.pincode} onChange={onChange} required style={{ maxWidth: 240 }} />
                        </div>

                        <h3 style={{ marginTop: 24 }}>Payment</h3>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
                            {[
                                { v: 'cod', l: 'Cash on Delivery' },
                                { v: 'upi', l: 'UPI' },
                                { v: 'card', l: 'Card' },
                                { v: 'netbanking', l: 'Net Banking' },
                            ].map((p) => (
                                <label key={p.v} style={{
                                    flex: 1, minWidth: 140, padding: '14px 18px', display: 'flex', alignItems: 'center',
                                    gap: 10, cursor: 'pointer',
                                    border: `1.5px solid ${form.paymentMethod === p.v ? 'var(--sage)' : 'var(--border)'}`,
                                    borderRadius: 999,
                                    background: form.paymentMethod === p.v ? 'var(--sage-soft)' : 'var(--paper)',
                                    fontSize: 13.5, fontWeight: 500,
                                }}>
                                    <input type="radio" name="paymentMethod" value={p.v} checked={form.paymentMethod === p.v} onChange={onChange} style={{ width: 'auto' }} />
                                    {p.l}
                                </label>
                            ))}
                        </div>

                        <div className="field">
                            <label>Order Notes</label>
                            <textarea name="notes" value={form.notes} onChange={onChange} placeholder="Delivery instructions, gate code..." />
                        </div>

                        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: 14 }}>
                            {loading ? 'Placing order...' : `Place Order — ₹${total}`}
                        </button>
                    </form>

                    <div className="checkout-summary-card">
                        <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, marginBottom: 18 }}>Order Summary</h3>

                        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 14, marginBottom: 14 }}>
                            {items.map((it) => (
                                <div key={it._id} style={{ display: 'flex', gap: 12, padding: '10px 0' }}>
                                    <img src={it.image} alt="" style={{ width: 56, height: 70, objectFit: 'cover', borderRadius: 6 }} />
                                    <div style={{ flex: 1, fontSize: 13.5 }}>
                                        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 500 }}>{it.name}</div>
                                        <div style={{ color: 'var(--ink-3)', fontSize: 12.5 }}>×{it.quantity} · {it.unit}</div>
                                    </div>
                                    <strong style={{ fontFamily: 'Fraunces, serif', fontSize: 15 }}>₹{it.price * it.quantity}</strong>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8, color: 'var(--ink-2)' }}><span>Subtotal</span><span>₹{subtotal}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8, color: 'var(--ink-2)' }}><span>Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8, color: 'var(--ink-2)' }}><span>Tax (5%)</span><span>₹{tax}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 14 }}>
                            <strong style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500 }}>Total</strong>
                            <strong style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em' }}>₹{total}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
