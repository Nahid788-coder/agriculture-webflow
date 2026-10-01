import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errorMessage } from '../api/axios';
import { invalidateCatalog, invalidate, keys } from '../api/store';
import { useAuth } from '../context/AuthContext.jsx';

const ORDER_STATUSES = ['placed', 'packing', 'out-for-delivery', 'delivered', 'cancelled'];
const SUB_STATUSES = ['active', 'paused', 'cancelled'];
const LOW = 10;
const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

function CouponForm({ onCreated }) {
    const blank = { code: '', description: '', type: 'percent', value: '', minOrder: '', maxDiscount: '', usageLimit: '' };
    const [f, setF] = useState(blank);
    const [busy, setBusy] = useState(false);
    const set = (k) => (e) => setF((x) => ({ ...x, [k]: k === 'code' ? e.target.value.toUpperCase() : e.target.value }));
    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            const { data } = await api.post('/coupons', f);
            onCreated(data);
            setF(blank);
            toast.success(`${data.code} created`);
        } catch (err) {
            toast.error(errorMessage(err, 'Could not create coupon'));
        } finally { setBusy(false); }
    };
    return (
        <form className="coupon-form" onSubmit={submit}>
            <input placeholder="CODE" value={f.code} onChange={set('code')} required maxLength={20} />
            <input placeholder="Description" value={f.description} onChange={set('description')} />
            <select value={f.type} onChange={set('type')}><option value="percent">% off</option><option value="flat">₹ off</option></select>
            <input type="number" min="1" placeholder="Value" value={f.value} onChange={set('value')} required />
            <input type="number" min="0" placeholder="Min order ₹" value={f.minOrder} onChange={set('minOrder')} />
            <input type="number" min="0" placeholder="Max off ₹" value={f.maxDiscount} onChange={set('maxDiscount')} />
            <input type="number" min="1" placeholder="Uses limit" value={f.usageLimit} onChange={set('usageLimit')} />
            <button className="btn btn-primary btn-sm" disabled={busy}>Add coupon</button>
        </form>
    );
}

export default function Admin() {
    const { user } = useAuth();
    const readOnly = user?.role === 'demo';
    const [tab, setTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [subs, setSubs] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);

    // Everything the console needs, loaded once in parallel. Edits update this state directly.
    useEffect(() => {
        let alive = true;
        Promise.all(['/stats', '/orders', '/products', '/subscriptions', '/coupons'].map((u) => api.get(u)))
            .then(([s, o, p, sub, c]) => {
                if (!alive) return;
                setStats(s.data); setOrders(o.data); setProducts(p.data); setSubs(sub.data); setCoupons(c.data);
            })
            .catch((err) => alive && toast.error(errorMessage(err, 'Failed to load admin data')))
            .finally(() => alive && setLoading(false));
        return () => { alive = false; };
    }, []);

    const lowStock = products.filter((p) => p.stock <= LOW).sort((a, b) => a.stock - b.stock);
    const revenue = orders.filter((o) => o.status === 'delivered').reduce((s, o) => s + o.total, 0);

    const updateOrder = async (id, status) => {
        if (status === 'cancelled' && !window.confirm('Cancel this order? Its items go back into stock.')) return;
        try {
            const { data } = await api.put(`/orders/${id}/status`, { status });
            setOrders((prev) => prev.map((o) => (o._id === id ? data : o)));
            if (status === 'cancelled') {
                const back = Object.fromEntries(data.items.map((i) => [String(i.product), i.quantity]));
                setProducts((prev) => prev.map((p) => (back[p._id] ? { ...p, stock: p.stock + back[p._id] } : p)));
                invalidateCatalog();
            }
            toast.success('Order updated');
        } catch (err) { toast.error(errorMessage(err, 'Failed')); }
    };

    const updateSub = async (id, status) => {
        try {
            const { data } = await api.put(`/subscriptions/${id}/status`, { status });
            setSubs((prev) => prev.map((s) => (s._id === id ? data : s)));
            toast.success('Subscription updated');
        } catch (err) { toast.error(errorMessage(err, 'Failed')); }
    };

    const saveStock = async (p, value) => {
        const stock = Number(value);
        if (!Number.isInteger(stock) || stock < 0 || stock === p.stock) return;
        try {
            const { data } = await api.put(`/products/${p._id}`, { stock });
            setProducts((prev) => prev.map((x) => (x._id === p._id ? data : x)));
            invalidateCatalog();
            toast.success(`${p.name}: stock ${stock}`);
        } catch (err) { toast.error(errorMessage(err, 'Failed')); }
    };

    const toggleCoupon = async (c) => {
        try {
            const { data } = await api.put(`/coupons/${c._id}`, { active: !c.active });
            setCoupons((prev) => prev.map((x) => (x._id === c._id ? data : x)));
            invalidate(keys.offers);
        } catch (err) { toast.error(errorMessage(err, 'Failed')); }
    };

    const tabs = [
        ['overview', 'Overview'],
        ['orders', `Orders (${orders.length})`],
        ['subs', `Subscriptions (${subs.length})`],
        ['products', `Products (${products.length})`],
        ['coupons', `Coupons (${coupons.length})`],
    ];

    return (
        <section className="admin-page">
            <div className="container">
                <div className="label-mono">Admin · Console</div>
                <h1 className="admin-title">Harvest <em>Console</em></h1>

                {readOnly && (
                    <div className="demo-banner">
                        <i className="fas fa-eye"></i>
                        Read-only demo. You can explore everything, but changes are disabled and customer contact details are hidden.
                    </div>
                )}

                <div className="admin-tabs">
                    {tabs.map(([id, label]) => (
                        <button key={id} className={`admin-tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</button>
                    ))}
                </div>

                {loading && <div className="skel" style={{ height: 240, borderRadius: 14 }}></div>}

                {!loading && tab === 'overview' && (
                    <>
                        <div className="stat-grid">
                            {[
                                { l: 'Delivered revenue', v: money(revenue) },
                                { l: 'Orders', v: orders.length },
                                { l: 'This month', v: stats?.totals.monthOrders ?? 0 },
                                { l: 'Active boxes', v: subs.filter((s) => s.status === 'active').length },
                                { l: 'Customers', v: stats?.totals.users ?? 0 },
                                { l: 'Low stock', v: lowStock.length, warn: lowStock.length > 0 },
                            ].map((s) => (
                                <div key={s.l} className={`stat ${s.warn ? 'warn' : ''}`}>
                                    <div className="label-mono">{s.l}</div>
                                    <div className="stat-v">{s.v}</div>
                                </div>
                            ))}
                        </div>
                        <div className="admin-panel">
                            <h3><i className="fas fa-triangle-exclamation"></i> Low-stock alerts</h3>
                            {lowStock.length === 0 ? <p className="muted">Everything is well stocked.</p> : (
                                <ul className="low-list">
                                    {lowStock.map((p) => (
                                        <li key={p._id}>
                                            <span>{p.name}</span>
                                            <strong className={p.stock === 0 ? 'out' : 'low'}>{p.stock === 0 ? 'Out of stock' : `${p.stock} left`}</strong>
                                            {!readOnly && <button className="btn-link" onClick={() => setTab('products')}>Restock →</button>}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </>
                )}

                {!loading && tab === 'orders' && (
                    <div className="table-wrap">
                        <table className="admin-table">
                            <thead><tr><th>Order</th><th>Customer</th><th>Delivery</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
                            <tbody>
                                {orders.length === 0 && <tr><td colSpan={6} className="muted center">No orders yet</td></tr>}
                                {orders.map((o) => (
                                    <tr key={o._id}>
                                        <td className="mono">#{o._id.slice(-6).toUpperCase()}<div className="muted small">{new Date(o.createdAt).toLocaleDateString('en-IN')}</div></td>
                                        <td><div className="strong">{o.customerName}</div><div className="muted small">{o.customerPhone}</div></td>
                                        <td><div>{o.deliverySlot?.label || '—'}</div><div className="muted small">{o.shippingAddress?.city} {o.shippingAddress?.pincode}</div></td>
                                        <td>{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                                        <td className="strong">{money(o.total)}{o.couponCode && <div className="muted small">{o.couponCode}</div>}</td>
                                        <td>
                                            <select value={o.status} disabled={readOnly || o.status === 'cancelled'} onChange={(e) => updateOrder(o._id, e.target.value)} className="status-select">
                                                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && tab === 'subs' && (
                    <div className="table-wrap">
                        <table className="admin-table">
                            <thead><tr><th>Customer</th><th>Box</th><th>Schedule</th><th>Next box</th><th>Per box</th><th>Status</th></tr></thead>
                            <tbody>
                                {subs.length === 0 && <tr><td colSpan={6} className="muted center">No subscriptions yet</td></tr>}
                                {subs.map((s) => (
                                    <tr key={s._id}>
                                        <td><div className="strong">{s.customerName}</div><div className="muted small">{s.customerEmail}</div></td>
                                        <td style={{ textTransform: 'capitalize' }}>{s.boxSize} · {s.items.length} items</td>
                                        <td style={{ textTransform: 'capitalize' }}>{s.frequency}, {s.deliveryDay}</td>
                                        <td>{s.status === 'active' && s.nextDelivery ? new Date(s.nextDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</td>
                                        <td className="strong">{money(s.boxPrice)}</td>
                                        <td>
                                            <select value={s.status} disabled={readOnly} onChange={(e) => updateSub(s._id, e.target.value)} className="status-select">
                                                {SUB_STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && tab === 'products' && (
                    <div className="table-wrap">
                        <table className="admin-table">
                            <thead><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Rating</th><th>Stock</th></tr></thead>
                            <tbody>
                                {products.map((p) => (
                                    <tr key={p._id}>
                                        <td><img src={p.images[0]} alt="" className="thumb" /></td>
                                        <td className="strong">{p.name}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{p.category}</td>
                                        <td>{money(p.price)}/{p.unit}</td>
                                        <td>{p.reviewCount ? `★ ${p.rating.toFixed(1)} (${p.reviewCount})` : '—'}</td>
                                        <td>
                                            <input
                                                type="number" min="0" defaultValue={p.stock} key={p.stock} disabled={readOnly}
                                                className={`stock-input ${p.stock === 0 ? 'out' : p.stock <= LOW ? 'low' : ''}`}
                                                onBlur={(e) => saveStock(p, e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                                                aria-label={`Stock for ${p.name}`}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && tab === 'coupons' && (
                    <>
                        {!readOnly && <CouponForm onCreated={(c) => { setCoupons((prev) => [c, ...prev]); invalidate(keys.offers); }} />}
                        <div className="table-wrap">
                            <table className="admin-table">
                                <thead><tr><th>Code</th><th>Offer</th><th>Min order</th><th>Used</th><th>Status</th></tr></thead>
                                <tbody>
                                    {coupons.map((c) => (
                                        <tr key={c._id}>
                                            <td className="mono strong">{c.code}</td>
                                            <td>{c.type === 'percent' ? `${c.value}% off` : `${money(c.value)} off`}{c.maxDiscount ? `, up to ${money(c.maxDiscount)}` : ''}<div className="muted small">{c.description}</div></td>
                                            <td>{c.minOrder ? money(c.minOrder) : '—'}</td>
                                            <td>{c.used}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
                                            <td>
                                                <button className={`toggle ${c.active ? 'on' : ''}`} disabled={readOnly} onClick={() => toggleCoupon(c)} aria-pressed={c.active}>
                                                    {c.active ? 'Active' : 'Off'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
