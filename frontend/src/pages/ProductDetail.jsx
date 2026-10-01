import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api, { errorMessage } from '../api/axios';
import { keys, getProductPage, invalidate } from '../api/store';
import { useCached } from '../hooks/useCached';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import ProductCard, { LOW_STOCK } from '../components/ProductCard.jsx';
import WishButton from '../components/WishButton.jsx';
import PincodeCheck from '../components/PincodeCheck.jsx';
import Stars from '../components/Stars.jsx';

function ReviewForm({ product, mine, onSaved }) {
    const [rating, setRating] = useState(mine?.rating || 0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState(mine?.comment || '');
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        if (!rating) return toast.error('Please choose a star rating');
        setBusy(true);
        try {
            const { data } = await api.post(`/products/${product._id}/reviews`, { rating, comment });
            toast.success(mine ? 'Review updated' : 'Thanks for your review!');
            onSaved(data);
        } catch (err) {
            toast.error(errorMessage(err, 'Could not save your review'));
        } finally {
            setBusy(false);
        }
    };

    return (
        <form className="review-form" onSubmit={submit}>
            <div className="label-mono">{mine ? 'Edit your review' : 'Write a review'}</div>
            <div className="star-input" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                    <button type="button" key={n} onMouseEnter={() => setHover(n)} onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? 's' : ''}`}>
                        <i className={`${(hover || rating) >= n ? 'fas' : 'far'} fa-star`}></i>
                    </button>
                ))}
            </div>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={600} placeholder="How was the taste, freshness, packaging?" />
            <button className="btn btn-primary btn-sm" disabled={busy}>{busy ? 'Saving…' : mine ? 'Update review' : 'Post review'}</button>
        </form>
    );
}

// Keyed by slug, so quantity, image and review state start fresh on every product.
export default function ProductDetail() {
    const { slug } = useParams();
    return <ProductPage key={slug} slug={slug} />;
}

function ProductPage({ slug }) {
    const { data, loading } = useCached(keys.product(slug), () => getProductPage(slug));
    const [local, setLocal] = useState(null); // review changes made on this page
    const [activeImg, setActiveImg] = useState(0);
    const [qty, setQty] = useState(1);
    const { addItem, setOpen } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    if (loading) {
        return (
            <section className="section" style={{ paddingTop: 130 }}>
                <div className="container pd-grid">
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

    const view = local;
    const product = { ...data.product, ...(view?.summary || {}) };
    const reviews = view?.reviews || data.reviews || [];
    const { related } = data;
    const soldOut = product.stock === 0;
    const maxQty = Math.min(25, product.stock);
    const mine = user && reviews.find((r) => r.user === user.id);

    const handleAdd = () => {
        const added = addItem(product, qty);
        if (added) {
            toast.success(`${product.name} added to bag`);
            setOpen(true);
        }
    };

    const onReviewSaved = ({ review, rating, reviewCount }) => {
        const rest = reviews.filter((r) => r.user !== review.user);
        setLocal({ reviews: [review, ...rest], summary: { rating, reviewCount } });
        invalidate(keys.product(slug), keys.products); // ratings changed
    };

    return (
        <section className="section" style={{ paddingTop: 130 }}>
            <div className="container">
                <div className="crumbs">
                    <Link to="/">Home</Link><span>/</span>
                    <Link to="/shop">Shop</Link><span>/</span>
                    <Link to={`/shop?category=${product.category}`} style={{ textTransform: 'capitalize' }}>{product.category}</Link>
                </div>

                <div className="pd-grid">
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
                        <div className="pd-main-img">
                            <motion.img key={activeImg} src={product.images[activeImg]} alt={product.name}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} />
                            <WishButton product={product} className="wish-btn big" />
                        </div>
                        {product.images.length > 1 && (
                            <div className="pd-thumbs">
                                {product.images.map((img, i) => (
                                    <button key={i} onClick={() => setActiveImg(i)} className={activeImg === i ? 'active' : ''} aria-label={`Image ${i + 1}`}>
                                        <img src={img} alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
                        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                            {product.organic && <span className="product-badge organic">Organic</span>}
                            {product.featured && <span className="product-badge feat">Featured</span>}
                            {product.certifications?.map((c, i) => <span key={i} className="product-badge">{c}</span>)}
                        </div>

                        <h1 className="pd-title">{product.name}</h1>
                        <p className="pd-short">{product.shortDescription}</p>

                        <div className="pd-price-row">
                            <div className="pd-price">₹{product.price}<small>/{product.unit}</small></div>
                            <a href="#reviews" className="pd-rating">
                                {product.reviewCount > 0
                                    ? <><Stars value={product.rating} /> {product.rating.toFixed(1)} <span>· {product.reviewCount} review{product.reviewCount > 1 ? 's' : ''}</span></>
                                    : <span>No reviews yet</span>}
                            </a>
                        </div>

                        <p className="pd-desc">{product.description}</p>

                        <div className="pd-facts">
                            <div><div className="label-mono">Farm</div><strong>{product.farm}</strong></div>
                            <div><div className="label-mono">Origin</div><strong>{product.origin}</strong></div>
                            {product.season && <div><div className="label-mono">Season</div><strong>{product.season}</strong></div>}
                            <div>
                                <div className="label-mono">Availability</div>
                                <strong className={soldOut ? 'out' : product.stock <= LOW_STOCK ? 'low' : 'ok'}>
                                    {soldOut ? 'Out of stock' : product.stock <= LOW_STOCK ? `Only ${product.stock} left` : 'In stock'}
                                </strong>
                            </div>
                        </div>

                        <PincodeCheck compact />

                        {soldOut ? (
                            <button className="btn btn-outline btn-block btn-lg" disabled style={{ marginBottom: 18 }}>Out of stock</button>
                        ) : (
                            <div className="pd-buy">
                                <div className="qty-pill">
                                    <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease"><i className="fas fa-minus"></i></button>
                                    <span>{qty}</span>
                                    <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))} aria-label="Increase"><i className="fas fa-plus"></i></button>
                                </div>
                                <button className="btn btn-primary btn-lg" onClick={handleAdd} style={{ flex: 1 }}>
                                    Add to Bag · ₹{product.price * qty}
                                </button>
                            </div>
                        )}

                        {product.subscriptionEligible && (
                            <Link to="/box-builder" className="btn btn-ghost btn-block">Or add it to a subscription box →</Link>
                        )}
                    </motion.div>
                </div>

                <div id="reviews" className="reviews">
                    <div className="reviews-head">
                        <h2 className="section-title" style={{ fontSize: 'clamp(30px, 3.4vw, 48px)' }}>Customer <em>reviews</em></h2>
                        {product.reviewCount > 0 && (
                            <div className="reviews-score"><strong>{product.rating.toFixed(1)}</strong><Stars value={product.rating} size={16} /><span>{product.reviewCount} review{product.reviewCount > 1 ? 's' : ''}</span></div>
                        )}
                    </div>

                    <div className="reviews-grid">
                        <div className="reviews-list">
                            {reviews.length === 0 && <p className="muted">No reviews yet. Be the first to share how it tasted.</p>}
                            {reviews.map((r) => (
                                <article key={r._id} className="review">
                                    <div className="review-top">
                                        <Stars value={r.rating} />
                                        <strong>{r.name}</strong>
                                        {r.verified && <span className="verified"><i className="fas fa-circle-check"></i> Verified buyer</span>}
                                        <time>{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</time>
                                    </div>
                                    {r.comment && <p>{r.comment}</p>}
                                </article>
                            ))}
                        </div>
                        <div>
                            {!user ? (
                                <div className="review-form">
                                    <div className="label-mono">Write a review</div>
                                    <p className="muted">Sign in to rate this product.</p>
                                    <button className="btn btn-outline btn-sm" onClick={() => navigate('/login')}>Sign in</button>
                                </div>
                            ) : user.role === 'demo' ? (
                                <div className="review-form"><p className="muted">The demo admin cannot post reviews.</p></div>
                            ) : (
                                <ReviewForm key={mine?._id || 'new'} product={product} mine={mine} onSaved={onReviewSaved} />
                            )}
                        </div>
                    </div>
                </div>

                {related?.length > 0 && (
                    <div style={{ marginTop: 90 }}>
                        <h2 className="section-title" style={{ fontSize: 'clamp(30px, 3.4vw, 48px)', marginBottom: 36 }}>You might <em>also</em> like</h2>
                        <div className="product-grid">
                            {related.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
