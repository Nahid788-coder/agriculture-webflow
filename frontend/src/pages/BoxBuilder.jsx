import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../api/axios';
import { keys, getProducts, checkPincode } from '../api/store';
import { useCached } from '../hooks/useCached';
import { useAuth } from '../context/AuthContext.jsx';

const BOX_SIZES = [
    { id: 'small', label: 'Small', desc: 'Up to 6 items', max: 6, basePrice: 599, multiplier: 1 },
    { id: 'medium', label: 'Medium', desc: 'Up to 10 items', max: 10, basePrice: 999, multiplier: 0.92 },
    { id: 'large', label: 'Large', desc: 'Up to 15 items', max: 15, basePrice: 1499, multiplier: 0.88 },
    { id: 'family', label: 'Family', desc: 'Up to 22 items', max: 22, basePrice: 1999, multiplier: 0.85 },
];

const FREQUENCIES = [
    { id: 'weekly', label: 'Weekly' },
    { id: 'biweekly', label: 'Bi-weekly' },
    { id: 'monthly', label: 'Monthly' },
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const CATS = ['all', 'vegetables', 'fruits', 'pantry', 'dairy', 'grains', 'bakery'];

export default function BoxBuilder() {
    // Shared catalog (same request as the shop); only box-eligible, in-stock produce is shown.
    const { data: catalog, loading } = useCached(keys.products, getProducts);
    const products = useMemo(() => catalog?.filter((p) => p.subscriptionEligible && p.stock > 0), [catalog]);
    const [deliveryDay, setDeliveryDay] = useState('saturday');
    const [pincode, setPincode] = useState(() => localStorage.getItem('hv_pincode') || '');
    const [address, setAddress] = useState('');
    const [selected, setSelected] = useState({});
    const [size, setSize] = useState(BOX_SIZES[1]);
    const [freq, setFreq] = useState('weekly');
    const [cat, setCat] = useState('all');
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const totalCount = useMemo(() => Object.values(selected).reduce((s, q) => s + q, 0), [selected]);

    const subtotal = useMemo(() => {
        if (!products) return 0;
        return Object.entries(selected).reduce((sum, [id, q]) => {
            const p = products.find((x) => x._id === id);
            return p ? sum + (p.price * q) : sum;
        }, 0);
    }, [selected, products]);

    const boxPrice = +(subtotal * size.multiplier).toFixed(0);
    const savings = subtotal - boxPrice;

    const filtered = useMemo(() => {
        if (!products) return [];
        if (cat === 'all') return products;
        return products.filter((p) => p.category === cat);
    }, [products, cat]);

    const toggle = (p) => {
        setSelected((prev) => {
            if (prev[p._id]) {
                const { [p._id]: _, ...rest } = prev;
                return rest;
            }
            if (totalCount >= size.max) {
                toast(`${size.label} box holds ${size.max} items max`, { icon: '⚖️' });
                return prev;
            }
            return { ...prev, [p._id]: 1 };
        });
    };

    const updateQty = (id, delta) => {
        setSelected((prev) => {
            const cur = prev[id] || 0;
            const next = cur + delta;
            if (next <= 0) {
                const { [id]: _, ...rest } = prev;
                return rest;
            }
            const totalIfNext = totalCount - cur + next;
            if (totalIfNext > size.max) {
                toast(`${size.label} box holds ${size.max} items max`, { icon: '⚖️' });
                return prev;
            }
            return { ...prev, [id]: next };
        });
    };

    const subscribe = async () => {
        if (totalCount === 0) return toast.error('Add some items to your box first');
        if (!user) {
            toast.error('Please sign in to subscribe');
            navigate('/login');
            return;
        }
        if (user.role === 'demo') return toast('The demo admin is read-only.');

        if (!/^\d{6}$/.test(pincode)) return toast.error('Enter your delivery pincode');
        if (!address.trim()) return toast.error('Enter your delivery address');

        setSubmitting(true);
        try {
            const pin = await checkPincode(pincode); // cached, so checking again costs nothing
            if (!pin.ok) { toast.error(pin.message); return; }
            localStorage.setItem('hv_pincode', pincode);
            // Only ids and quantities are sent; the server prices the box.
            const { data } = await api.post('/subscriptions', {
                items: Object.entries(selected).map(([product, quantity]) => ({ product, quantity })),
                boxSize: size.id,
                frequency: freq,
                deliveryDay,
                pincode,
                address,
                phone: user.phone,
            });
            toast.success(`Subscribed! First box on ${new Date(data.nextDelivery).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}`);
            setSelected({});
            navigate('/orders');
        } catch (err) {
            toast.error(errorMessage(err, 'Could not create the subscription'));
        } finally {
            setSubmitting(false);
        }
    };

    const selectedItems = useMemo(() => {
        if (!products) return [];
        return Object.entries(selected).map(([id, q]) => {
            const p = products.find((x) => x._id === id);
            return p ? { ...p, qty: q } : null;
        }).filter(Boolean);
    }, [selected, products]);

    return (
        <>
            <header className="page-title-bar">
                <div className="container">
                    <div className="label-mono">Subscriptions · Build a Box</div>
                    <h1 style={{ marginTop: 18 }}>
                        Pick your<br /><em>weekly</em> box.
                    </h1>
                    <p>Choose your size, your frequency, your produce. Save up to 15% vs. one-time orders. Pause anytime.</p>
                </div>
            </header>

            <section className="builder-page">
                <div className="container">
                    <div className="builder-grid">
                        {/* LEFT — Products */}
                        <div className="builder-products">
                            <div className="builder-filter">
                                {CATS.map((c) => (
                                    <button
                                        key={c}
                                        className={`builder-filter-pill ${cat === c ? 'active' : ''}`}
                                        onClick={() => setCat(c)}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>

                            {loading ? (
                                <div className="builder-pgrid">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i}>
                                            <div className="skel" style={{ aspectRatio: 1 }}></div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="builder-pgrid">
                                    <AnimatePresence>
                                        {filtered.map((p) => {
                                            const isSelected = !!selected[p._id];
                                            return (
                                                <motion.div
                                                    key={p._id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    className={`builder-pcard ${isSelected ? 'added' : ''}`}
                                                    onClick={() => toggle(p)}
                                                >
                                                    <button className="builder-pcard-add" aria-label={isSelected ? 'Remove' : 'Add'}>
                                                        <i className={`fas ${isSelected ? 'fa-check' : 'fa-plus'}`}></i>
                                                    </button>
                                                    <img src={p.images[0]} alt={p.name} loading="lazy" />
                                                    <div className="builder-pcard-body">
                                                        <h4>{p.name}</h4>
                                                        <div className="builder-pcard-foot">
                                                            <span>{p.unit}</span>
                                                            <strong>₹{p.price}</strong>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {/* RIGHT — Summary */}
                        <div className="builder-summary">
                            <h3>Your <em>Box</em></h3>
                            <p style={{ fontSize: 14, color: 'var(--ink-3)', fontStyle: 'italic', fontFamily: 'var(--font-body)', fontWeight: 300 }}>
                                {totalCount} of {size.max} items
                            </p>

                            <div style={{ marginTop: 22 }}>
                                <div className="label-mono" style={{ marginBottom: 12 }}>Box Size</div>
                                <div className="builder-size-options">
                                    {BOX_SIZES.map((s) => (
                                        <button
                                            key={s.id}
                                            className={`size-option ${size.id === s.id ? 'active' : ''}`}
                                            onClick={() => setSize(s)}
                                        >
                                            <strong>{s.label}</strong>
                                            <span>{s.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="label-mono" style={{ marginBottom: 12 }}>Frequency</div>
                                <div className="builder-frequency">
                                    {FREQUENCIES.map((f) => (
                                        <button
                                            key={f.id}
                                            className={`freq-option ${freq === f.id ? 'active' : ''}`}
                                            onClick={() => setFreq(f.id)}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="label-mono" style={{ marginBottom: 12 }}>Items in box</div>
                                <div className="builder-items-list">
                                    {selectedItems.length === 0 ? (
                                        <div className="builder-empty">Click items on the left to start.</div>
                                    ) : (
                                        <AnimatePresence>
                                            {selectedItems.map((it) => (
                                                <motion.div
                                                    key={it._id}
                                                    layout
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="builder-item"
                                                >
                                                    <img src={it.images[0]} alt="" />
                                                    <div className="builder-item-info">
                                                        <strong>{it.name}</strong>
                                                        <span>×{it.qty} · ₹{it.price * it.qty}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                                        <button onClick={() => updateQty(it._id, -1)} className="builder-item-x" style={{ background: 'var(--bg-2)', border: 'none', color: 'var(--ink)' }}>
                                                            <i className="fas fa-minus" style={{ fontSize: 9 }}></i>
                                                        </button>
                                                        <button onClick={() => updateQty(it._id, 1)} className="builder-item-x" style={{ background: 'var(--bg-2)', border: 'none', color: 'var(--ink)' }}>
                                                            <i className="fas fa-plus" style={{ fontSize: 9 }}></i>
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="label-mono" style={{ marginBottom: 12 }}>Delivery</div>
                                <div className="builder-delivery">
                                    <select value={deliveryDay} onChange={(e) => setDeliveryDay(e.target.value)} aria-label="Delivery day">
                                        {DAYS.map((d) => <option key={d} value={d}>Every {d[0].toUpperCase() + d.slice(1)}</option>)}
                                    </select>
                                    <input inputMode="numeric" maxLength={6} placeholder="Pincode" aria-label="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))} />
                                    <input placeholder="House / street, area" aria-label="Delivery address" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={160} />
                                </div>
                            </div>

                            <div className="builder-totals">
                                <div className="builder-total-row"><span>Items subtotal</span><span>₹{subtotal}</span></div>
                                {savings > 0 && (
                                    <div className="builder-total-row" style={{ color: 'var(--sage)' }}>
                                        <span>Subscription savings</span><span>−₹{savings.toFixed(0)}</span>
                                    </div>
                                )}
                                <div className="builder-total-row"><span>Frequency</span><span style={{ textTransform: 'capitalize' }}>{freq}</span></div>
                                <div className="builder-total-row grand">
                                    <span>Per box</span>
                                    <span>₹{boxPrice}</span>
                                </div>
                            </div>

                            <button
                                className="btn btn-primary btn-block"
                                onClick={subscribe}
                                disabled={submitting || totalCount === 0}
                                style={{ marginTop: 20 }}
                            >
                                {submitting ? 'Creating...' : `Subscribe — ₹${boxPrice}/${freq === 'weekly' ? 'wk' : freq === 'biweekly' ? '2wk' : 'mo'}`}
                            </button>
                            <p style={{ fontSize: 12, color: 'var(--ink-3)', textAlign: 'center', marginTop: 14, fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>
                                Pause, skip or cancel anytime from My Orders.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
