import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useFetch, useMutation } from '../hooks/useFetch';
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

const CATS = ['all', 'vegetables', 'fruits', 'pantry', 'dairy', 'grains', 'bakery'];

export default function BoxBuilder() {
    const { data: products, loading } = useFetch('/products?subscribable=true');
    const [selected, setSelected] = useState({});
    const [size, setSize] = useState(BOX_SIZES[1]);
    const [freq, setFreq] = useState('weekly');
    const [cat, setCat] = useState('all');
    const { mutate, loading: submitting } = useMutation('/subscriptions');
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

        try {
            const items = Object.entries(selected).map(([id, q]) => {
                const p = products.find((x) => x._id === id);
                return {
                    product: id,
                    name: p.name,
                    image: p.images[0],
                    price: p.price,
                    quantity: q,
                };
            });

            await mutate({
                customerName: user.name,
                customerEmail: user.email,
                customerPhone: user.phone || '',
                boxName: `${size.label} ${freq[0].toUpperCase() + freq.slice(1)} Box`,
                boxSize: size.id,
                items,
                boxPrice,
                frequency: freq,
                deliveryDay: 'wednesday',
            });
            toast.success('Subscription created! Check Orders for details.');
            setSelected({});
            navigate('/orders');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
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
                            <p style={{ fontSize: 14, color: 'var(--ink-3)', fontStyle: 'italic', fontFamily: 'Fraunces, serif', fontWeight: 300 }}>
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
                            <p style={{ fontSize: 12, color: 'var(--ink-3)', textAlign: 'center', marginTop: 14, fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>
                                Pause or skip anytime. No commitment.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
