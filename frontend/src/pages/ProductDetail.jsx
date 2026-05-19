import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useFetch } from '../hooks/useFetch';
import { useCart } from '../context/CartContext.jsx';
import ProductCard from '../components/ProductCard.jsx';

export default function ProductDetail() {
    const { slug } = useParams();
    const { data, loading } = useFetch(`/products/${slug}`);
    const [activeImg, setActiveImg] = useState(0);
    const [qty, setQty] = useState(1);
    const { addItem, setOpen } = useCart();

    if (loading) {
        return (
            <section className="section" style={{ paddingTop: 130 }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 60 }}>
                    <div className="skel" style={{ aspectRatio: '4/5', borderRadius: 14 }}></div>
                    <div>
                        <div className="skel" style={{ height: 16, width: '30%', marginBottom: 16 }}></div>
                        <div className="skel" style={{ height: 60, width: '70%', marginBottom: 24 }}></div>
                        <div className="skel" style={{ height: 16, width: '90%', marginBottom: 8 }}></div>
                    </div>
                </div>
            </section>
        );
    }
    if (!data?.product) return (
        <div style={{ padding: 130, textAlign: 'center' }}>
            <h2 style={{ fontSize: 48 }}>Product not found</h2>
            <Link to="/shop" className="btn btn-primary" style={{ marginTop: 30 }}>Back to Shop</Link>
        </div>
    );

    const { product, related } = data;

    const handleAdd = () => {
        for (let i = 0; i < qty; i++) addItem(product, 1);
        toast.success(`${product.name} added to bag`);
        setOpen(true);
    };

    return (
        <>
            <section className="section" style={{ paddingTop: 130 }}>
                <div className="container">
                    <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 30 }}>
                        <Link to="/" style={{ color: 'var(--ink-3)' }}>Home</Link>
                        <span style={{ margin: '0 10px' }}>/</span>
                        <Link to="/shop" style={{ color: 'var(--ink-3)' }}>Shop</Link>
                        <span style={{ margin: '0 10px' }}>/</span>
                        <Link to={`/shop?category=${product.category}`} style={{ color: 'var(--ink-3)', textTransform: 'capitalize' }}>{product.category}</Link>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 70, alignItems: 'flex-start' }}>
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7 }}
                        >
                            <div style={{ width: '100%', aspectRatio: '4/5', overflow: 'hidden', borderRadius: 14, marginBottom: 14, background: 'var(--bg-2)', boxShadow: 'var(--shadow)' }}>
                                <motion.img
                                    key={activeImg}
                                    src={product.images[activeImg]}
                                    alt={product.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.4 }}
                                />
                            </div>
                            {product.images.length > 1 && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                                    {product.images.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImg(i)}
                                            style={{
                                                aspectRatio: 1,
                                                borderRadius: 10,
                                                overflow: 'hidden',
                                                border: `2px solid ${activeImg === i ? 'var(--sage)' : 'transparent'}`,
                                                cursor: 'pointer',
                                                background: 'transparent',
                                                padding: 0,
                                            }}
                                        >
                                            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7 }}
                        >
                            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                                {product.organic && <span className="product-badge organic">Organic</span>}
                                {product.featured && <span className="product-badge feat">Featured</span>}
                                {product.certifications?.map((c, i) => (
                                    <span key={i} className="product-badge">{c}</span>
                                ))}
                            </div>

                            <h1 style={{ fontSize: 'clamp(40px, 5vw, 76px)', fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 18 }}>
                                {product.name}
                            </h1>
                            <p style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 300, fontSize: 22, color: 'var(--ink-2)', marginBottom: 26, lineHeight: 1.4 }}>
                                {product.shortDescription}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, marginBottom: 30 }}>
                                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 48, fontWeight: 500, letterSpacing: '-0.02em' }}>
                                    ₹{product.price}<small style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: 'var(--ink-3)', fontWeight: 400, marginLeft: 6 }}>/{product.unit}</small>
                                </div>
                                {product.rating > 0 && (
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                                        <i className="fas fa-star" style={{ color: 'var(--honey)' }}></i>
                                        {product.rating.toFixed(1)} <span style={{ color: 'var(--ink-3)' }}>· {product.reviewCount} reviews</span>
                                    </div>
                                )}
                            </div>

                            <p style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--ink-2)', marginBottom: 30 }}>
                                {product.description}
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0, padding: 22, background: 'var(--bg-2)', borderRadius: 14, marginBottom: 30 }}>
                                <div style={{ paddingRight: 18, borderRight: '1px solid var(--border)' }}>
                                    <div className="label-mono" style={{ marginBottom: 6, fontSize: 10 }}>Farm</div>
                                    <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 500 }}>{product.farm}</div>
                                </div>
                                <div style={{ paddingLeft: 18 }}>
                                    <div className="label-mono" style={{ marginBottom: 6, fontSize: 10 }}>Origin</div>
                                    <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 500 }}>{product.origin}</div>
                                </div>
                                {product.season && (
                                    <div style={{ paddingRight: 18, borderRight: '1px solid var(--border)', borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 14 }}>
                                        <div className="label-mono" style={{ marginBottom: 6, fontSize: 10 }}>Season</div>
                                        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 500 }}>{product.season}</div>
                                    </div>
                                )}
                                {product.stock > 0 && (
                                    <div style={{ paddingLeft: 18, borderTop: product.season ? '1px solid var(--border)' : 'none', paddingTop: product.season ? 14 : 0, marginTop: product.season ? 14 : 0 }}>
                                        <div className="label-mono" style={{ marginBottom: 6, fontSize: 10 }}>In stock</div>
                                        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 500, color: 'var(--sage)' }}>{product.stock} available</div>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 18 }}>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 999, padding: 4 }}>
                                    <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ width: 36, height: 36, borderRadius: '50%', background: 'transparent', border: 'none', fontSize: 14 }}>
                                        <i className="fas fa-minus"></i>
                                    </button>
                                    <span style={{ minWidth: 30, textAlign: 'center', fontWeight: 600, fontSize: 15 }}>{qty}</span>
                                    <button onClick={() => setQty((q) => q + 1)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'transparent', border: 'none', fontSize: 14 }}>
                                        <i className="fas fa-plus"></i>
                                    </button>
                                </div>
                                <button className="btn btn-primary btn-lg" onClick={handleAdd} style={{ flex: 1 }}>
                                    Add to Bag · ₹{product.price * qty}
                                </button>
                            </div>

                            <Link to="/box-builder" className="btn btn-ghost btn-block">Or add to a Subscription Box →</Link>
                        </motion.div>
                    </div>

                    {related?.length > 0 && (
                        <div style={{ marginTop: 100 }}>
                            <h2 className="section-title" style={{ fontSize: 'clamp(36px, 4vw, 64px)', marginBottom: 40 }}>You might <em>also</em> like</h2>
                            <div className="product-grid">
                                {related.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
