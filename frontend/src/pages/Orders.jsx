import { useFetch } from '../hooks/useFetch';

export default function Orders() {
    const { data: orders, loading } = useFetch('/orders/my');
    const { data: subs } = useFetch('/subscriptions/my');

    return (
        <section className="section" style={{ paddingTop: 130 }}>
            <div className="container" style={{ maxWidth: 1080 }}>
                <div className="label-mono">My account</div>
                <h1 style={{ fontSize: 'clamp(40px, 5vw, 76px)', fontFamily: 'Fraunces, serif', fontWeight: 400, letterSpacing: '-0.03em', marginTop: 18, marginBottom: 12 }}>
                    Orders & <em>Subscriptions</em>
                </h1>
                <p style={{ color: 'var(--ink-2)', marginBottom: 50, fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 18 }}>
                    Your past deliveries and active subscriptions in one place.
                </p>

                {/* Subscriptions */}
                {subs?.length > 0 && (
                    <>
                        <h2 style={{ fontSize: 32, fontFamily: 'Fraunces, serif', fontWeight: 500, marginBottom: 24, letterSpacing: '-0.02em' }}>Active <em style={{ color: 'var(--sage)', fontStyle: 'italic' }}>subscriptions</em></h2>
                        <div style={{ display: 'grid', gap: 16, marginBottom: 60 }}>
                            {subs.map((s) => (
                                <article key={s._id} style={{ background: 'var(--paper)', border: '1.5px solid var(--border)', borderRadius: 18, padding: 28 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
                                        <div>
                                            <strong style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500 }}>{s.boxName}</strong>
                                            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 4, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: 1 }}>
                                                {s.frequency} · {s.items.length} items · Next: {s.nextDelivery ? new Date(s.nextDelivery).toLocaleDateString() : 'TBD'}
                                            </div>
                                        </div>
                                        <span className={`status-pill status-${s.status}`}>{s.status}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {s.items.slice(0, 8).map((it, i) => (
                                            <span key={i} style={{ fontSize: 12.5, padding: '6px 12px', background: 'var(--bg-2)', borderRadius: 999 }}>
                                                {it.name} ×{it.quantity}
                                            </span>
                                        ))}
                                        {s.items.length > 8 && <span style={{ fontSize: 12, color: 'var(--ink-3)', alignSelf: 'center' }}>+{s.items.length - 8} more</span>}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                                        <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>per box</span>
                                        <strong style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 500 }}>₹{s.boxPrice}</strong>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </>
                )}

                {/* Orders */}
                <h2 style={{ fontSize: 32, fontFamily: 'Fraunces, serif', fontWeight: 500, marginBottom: 24, letterSpacing: '-0.02em' }}>Past <em style={{ color: 'var(--sage)', fontStyle: 'italic' }}>orders</em></h2>

                {loading ? (
                    <p style={{ color: 'var(--ink-3)', textAlign: 'center', padding: 40, fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>Loading...</p>
                ) : !orders?.length && !subs?.length ? (
                    <div style={{ textAlign: 'center', padding: 60, background: 'var(--paper)', borderRadius: 18, border: '1.5px solid var(--border)' }}>
                        <i className="fas fa-bag-shopping" style={{ fontSize: 56, color: 'var(--dim)', marginBottom: 18 }}></i>
                        <p style={{ fontSize: 22, fontFamily: 'Fraunces, serif', fontWeight: 500 }}>No orders yet</p>
                        <p style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 8, fontStyle: 'italic', fontFamily: 'Fraunces, serif' }}>Place your first order to see it here.</p>
                    </div>
                ) : !orders?.length ? (
                    <p style={{ color: 'var(--ink-3)', fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>No one-time orders yet.</p>
                ) : (
                    <div style={{ display: 'grid', gap: 16 }}>
                        {orders.map((o) => (
                            <article key={o._id} style={{ background: 'var(--paper)', border: '1.5px solid var(--border)', borderRadius: 18, padding: 28 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                                    <div>
                                        <strong style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, letterSpacing: 1 }}>#{o._id.slice(-8).toUpperCase()}</strong>
                                        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 4 }}>{new Date(o.createdAt).toLocaleString()}</div>
                                    </div>
                                    <span className={`status-pill status-${o.status}`}>{o.status}</span>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                                    {o.items.slice(0, 6).map((it, i) => (
                                        <span key={i} style={{ fontSize: 12.5, padding: '6px 12px', background: 'var(--bg-2)', borderRadius: 999 }}>
                                            {it.name} ×{it.quantity}
                                        </span>
                                    ))}
                                    {o.items.length > 6 && <span style={{ fontSize: 12, color: 'var(--ink-3)', alignSelf: 'center' }}>+{o.items.length - 6} more</span>}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                                    <span style={{ fontSize: 13, color: 'var(--ink-3)', textTransform: 'uppercase' }}>{o.paymentMethod}</span>
                                    <strong style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 500 }}>₹{o.total}</strong>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
