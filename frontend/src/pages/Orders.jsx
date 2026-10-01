import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errorMessage } from '../api/axios';
import { invalidateCatalog } from '../api/store';

const money = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const date = (d) => new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
const STEPS = ['placed', 'packing', 'out-for-delivery', 'delivered'];

function Timeline({ status }) {
    if (status === 'cancelled') return null;
    const at = STEPS.indexOf(status);
    return (
        <ol className="timeline">
            {STEPS.map((s, i) => <li key={s} className={i <= at ? 'done' : ''}><span></span>{s.replace(/-/g, ' ')}</li>)}
        </ol>
    );
}

export default function Orders() {
    const [orders, setOrders] = useState(null);
    const [subs, setSubs] = useState(null);
    const [busy, setBusy] = useState(null);

    useEffect(() => {
        let alive = true;
        Promise.all([api.get('/orders/my'), api.get('/subscriptions/my')])
            .then(([o, s]) => { if (alive) { setOrders(o.data); setSubs(s.data); } })
            .catch((err) => { if (alive) { toast.error(errorMessage(err, 'Could not load your orders')); setOrders([]); setSubs([]); } });
        return () => { alive = false; };
    }, []);

    const cancelOrder = async (o) => {
        if (!window.confirm('Cancel this order?')) return;
        setBusy(o._id);
        try {
            const { data } = await api.post(`/orders/${o._id}/cancel`);
            setOrders((prev) => prev.map((x) => (x._id === o._id ? data : x)));
            invalidateCatalog(); // items are back in stock
            toast.success('Order cancelled');
        } catch (err) {
            toast.error(errorMessage(err, 'Could not cancel'));
        } finally { setBusy(null); }
    };

    const subAction = async (s, action) => {
        if (action === 'cancel' && !window.confirm('Cancel this subscription? You can build a new box any time.')) return;
        setBusy(s._id + action);
        try {
            const { data } = await api.post(`/subscriptions/${s._id}/${action}`);
            setSubs((prev) => prev.map((x) => (x._id === s._id ? data : x)));
            toast.success({ pause: 'Subscription paused', resume: 'Welcome back! Subscription resumed', skip: `Skipped. Next box: ${date(data.nextDelivery)}`, cancel: 'Subscription cancelled' }[action]);
        } catch (err) {
            toast.error(errorMessage(err, 'Could not update the subscription'));
        } finally { setBusy(null); }
    };

    const loading = orders === null;

    return (
        <section className="section" style={{ paddingTop: 130 }}>
            <div className="container" style={{ maxWidth: 1080 }}>
                <div className="label-mono">My account</div>
                <h1 className="account-title">Orders & <em>subscriptions</em></h1>

                {subs?.length > 0 && (
                    <>
                        <h2 className="account-h2">Your <em>boxes</em></h2>
                        <div className="account-list">
                            {subs.map((s) => (
                                <article key={s._id} className="account-card">
                                    <div className="account-card-head">
                                        <div>
                                            <strong className="account-card-title">{s.boxName}</strong>
                                            <div className="account-meta">
                                                {s.items.length} items · every {s.frequency === 'weekly' ? 'week' : s.frequency === 'biweekly' ? '2 weeks' : 'month'} · {s.deliveryDay}s
                                            </div>
                                        </div>
                                        <span className={`status-pill status-${s.status}`}>{s.status}</span>
                                    </div>
                                    {s.status === 'active' && s.nextDelivery && (
                                        <div className="next-box"><i className="fas fa-truck"></i> Next box: <strong>{date(s.nextDelivery)}</strong>{s.skippedCount > 0 && <span> · skipped {s.skippedCount}×</span>}</div>
                                    )}
                                    {s.status === 'paused' && <div className="next-box paused"><i className="fas fa-pause"></i> Paused. Resume whenever you like.</div>}
                                    <div className="chips">
                                        {s.items.slice(0, 8).map((it, i) => <span key={i}>{it.name} ×{it.quantity}</span>)}
                                        {s.items.length > 8 && <span className="more">+{s.items.length - 8} more</span>}
                                    </div>
                                    <div className="account-card-foot">
                                        <div className="sub-actions">
                                            {s.status === 'active' && <>
                                                <button className="btn btn-ghost btn-sm" disabled={!!busy} onClick={() => subAction(s, 'skip')}>Skip next box</button>
                                                <button className="btn btn-ghost btn-sm" disabled={!!busy} onClick={() => subAction(s, 'pause')}>Pause</button>
                                            </>}
                                            {s.status === 'paused' && <button className="btn btn-primary btn-sm" disabled={!!busy} onClick={() => subAction(s, 'resume')}>Resume</button>}
                                            {s.status !== 'cancelled' && <button className="btn-link danger" disabled={!!busy} onClick={() => subAction(s, 'cancel')}>Cancel</button>}
                                        </div>
                                        <div className="price-big">{money(s.boxPrice)}<small>/box</small></div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </>
                )}

                <h2 className="account-h2">Your <em>orders</em></h2>
                {loading ? (
                    <div className="account-list">{[0, 1].map((i) => <div key={i} className="skel" style={{ height: 180, borderRadius: 18 }}></div>)}</div>
                ) : orders.length === 0 ? (
                    <div className="empty-card">
                        <i className="fas fa-bag-shopping"></i>
                        <h3>No orders yet</h3>
                        <p>Your first basket is a few clicks away.</p>
                        <Link to="/shop" className="btn btn-primary">Shop now</Link>
                    </div>
                ) : (
                    <div className="account-list">
                        {orders.map((o) => (
                            <article key={o._id} className="account-card">
                                <div className="account-card-head">
                                    <div>
                                        <strong className="order-id">#{o._id.slice(-8).toUpperCase()}</strong>
                                        <div className="account-meta">Placed {new Date(o.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</div>
                                    </div>
                                    <span className={`status-pill status-${o.status}`}>{o.status.replace(/-/g, ' ')}</span>
                                </div>
                                <Timeline status={o.status} />
                                {o.deliverySlot?.label && o.status !== 'cancelled' && (
                                    <div className="next-box"><i className="fas fa-calendar-check"></i> Delivery: <strong>{o.deliverySlot.label}</strong></div>
                                )}
                                <div className="chips">
                                    {o.items.slice(0, 6).map((it, i) => <span key={i}>{it.name} ×{it.quantity}</span>)}
                                    {o.items.length > 6 && <span className="more">+{o.items.length - 6} more</span>}
                                </div>
                                <div className="account-card-foot">
                                    <div className="account-meta">
                                        Pay on delivery{o.discount > 0 && <> · {o.couponCode} saved {money(o.discount)}</>}
                                        {o.status === 'placed' && <button className="btn-link danger" disabled={busy === o._id} onClick={() => cancelOrder(o)}>Cancel order</button>}
                                    </div>
                                    <div className="price-big">{money(o.total)}</div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
