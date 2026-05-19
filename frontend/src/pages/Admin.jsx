import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const ORDER_STATUSES = ['placed', 'packing', 'out-for-delivery', 'delivered', 'cancelled'];
const SUB_STATUSES = ['active', 'paused', 'cancelled'];

export default function Admin() {
    const [tab, setTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [subs, setSubs] = useState([]);

    const refreshStats = useCallback(async () => {
        try { const { data } = await api.get('/stats'); setStats(data); } catch { /* */ }
    }, []);

    useEffect(() => {
        const ctrl = new AbortController();
        const opts = { signal: ctrl.signal };
        Promise.all([
            api.get('/stats', opts),
            api.get('/orders', opts),
            api.get('/products', opts),
            api.get('/subscriptions', opts),
        ])
            .then(([s, o, p, sub]) => {
                setStats(s.data); setOrders(o.data); setProducts(p.data); setSubs(sub.data);
            })
            .catch((err) => {
                if (err.code === 'ERR_CANCELED') return;
                toast.error('Failed to load admin data');
            });
        return () => ctrl.abort();
    }, []);

    const updateOrder = async (id, status) => {
        try {
            const { data } = await api.put(`/orders/${id}/status`, { status });
            setOrders((prev) => prev.map((o) => (o._id === id ? data : o)));
            toast.success('Updated');
            refreshStats();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        }
    };

    const updateSub = async (id, status) => {
        try {
            const { data } = await api.put(`/subscriptions/${id}`, { status });
            setSubs((prev) => prev.map((s) => (s._id === id ? data : s)));
            toast.success('Updated');
            refreshStats();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        }
    };

    const totals = stats?.totals || {};

    return (
        <section className="admin-page">
            <div className="container">
                <div className="label-mono">Admin · Console</div>
                <h1 style={{ fontSize: 'clamp(40px, 5vw, 76px)', fontFamily: 'Fraunces, serif', fontWeight: 400, letterSpacing: '-0.03em', marginTop: 16 }}>
                    Harvest <em style={{ color: 'var(--sage)', fontStyle: 'italic' }}>Console</em>
                </h1>

                <div className="admin-tabs">
                    <button className={`admin-tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
                    <button className={`admin-tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>Orders ({orders.length})</button>
                    <button className={`admin-tab ${tab === 'subs' ? 'active' : ''}`} onClick={() => setTab('subs')}>Subscriptions ({subs.length})</button>
                    <button className={`admin-tab ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>Products ({products.length})</button>
                </div>

                {tab === 'overview' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 0, borderTop: '1.5px solid var(--border)', borderLeft: '1.5px solid var(--border)', background: 'var(--paper)', borderRadius: 14, overflow: 'hidden' }}>
                        {[
                            { l: 'Total Revenue', v: `₹${(totals.revenue || 0).toLocaleString('en-IN')}` },
                            { l: 'Total Orders', v: totals.orders ?? 0 },
                            { l: 'This month', v: totals.monthOrders ?? 0 },
                            { l: 'Active Subs', v: totals.activeSubs ?? 0 },
                            { l: 'Products', v: totals.products ?? 0 },
                            { l: 'Recipes', v: totals.recipes ?? 0 },
                            { l: 'Customers', v: totals.users ?? 0 },
                        ].map((s, i) => (
                            <div key={i} style={{ padding: 36, borderRight: '1.5px solid var(--border)', borderBottom: '1.5px solid var(--border)' }}>
                                <div className="label-mono" style={{ marginBottom: 16, color: 'var(--ink-3)' }}>{s.l}</div>
                                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 48, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 0.9 }}>{s.v}</div>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'orders' && (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                            <thead>
                                <tr><th>ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--ink-3)', fontStyle: 'italic', fontFamily: 'Fraunces, serif' }}>No orders yet</td></tr>}
                                {orders.map((o) => (
                                    <tr key={o._id}>
                                        <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>#{o._id.slice(-6).toUpperCase()}</td>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{o.customerName}</div>
                                            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{o.customerPhone}</div>
                                        </td>
                                        <td>{o.items.length}</td>
                                        <td style={{ fontWeight: 600, fontFamily: 'Fraunces, serif', fontSize: 16 }}>₹{o.total}</td>
                                        <td style={{ textTransform: 'uppercase', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>{o.paymentMethod}</td>
                                        <td>
                                            <select value={o.status} onChange={(e) => updateOrder(o._id, e.target.value)} style={{ padding: '6px 12px', fontSize: 12, width: 'auto', borderRadius: 999 }}>
                                                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === 'subs' && (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                            <thead>
                                <tr><th>Customer</th><th>Box</th><th>Frequency</th><th>Items</th><th>Per Box</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                {subs.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--ink-3)', fontStyle: 'italic', fontFamily: 'Fraunces, serif' }}>No subscriptions yet</td></tr>}
                                {subs.map((s) => (
                                    <tr key={s._id}>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{s.customerName}</div>
                                            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{s.customerEmail}</div>
                                        </td>
                                        <td style={{ textTransform: 'capitalize' }}>{s.boxSize}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{s.frequency}</td>
                                        <td>{s.items.length}</td>
                                        <td style={{ fontWeight: 600, fontFamily: 'Fraunces, serif', fontSize: 16 }}>₹{s.boxPrice}</td>
                                        <td>
                                            <select value={s.status} onChange={(e) => updateSub(s._id, e.target.value)} style={{ padding: '6px 12px', fontSize: 12, width: 'auto', borderRadius: 999 }}>
                                                {SUB_STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === 'products' && (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                            <thead><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th></tr></thead>
                            <tbody>
                                {products.map((p) => (
                                    <tr key={p._id}>
                                        <td><img src={p.images[0]} alt="" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }} /></td>
                                        <td style={{ fontWeight: 500 }}>{p.name}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{p.category}</td>
                                        <td style={{ fontWeight: 600, fontFamily: 'Fraunces, serif' }}>₹{p.price}/{p.unit}</td>
                                        <td>{p.stock}</td>
                                        <td>{p.featured ? <span style={{ color: 'var(--honey)' }}>★</span> : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
}
