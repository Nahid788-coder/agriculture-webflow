import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useCached } from '../hooks/useCached';
import { keys, getProducts, getRecipes } from '../api/store';
import ProductCard from '../components/ProductCard.jsx';

const fade = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } };

const CATEGORIES = [
    { id: 'vegetables', name: 'Vegetables', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&q=85&auto=format&fit=crop' },
    { id: 'fruits', name: 'Fruits', img: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=900&q=85&auto=format&fit=crop' },
    { id: 'pantry', name: 'Pantry', img: 'https://images.unsplash.com/photo-1481931715705-36f5f6ee3a90?w=900&q=85&auto=format&fit=crop' },
    { id: 'dairy', name: 'Dairy', img: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=900&q=85&auto=format&fit=crop' },
    { id: 'grains', name: 'Grains', img: 'https://images.unsplash.com/photo-1568376794508-ae52c6ab3929?w=900&q=85&auto=format&fit=crop' },
    { id: 'bakery', name: 'Bakery', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&q=85&auto=format&fit=crop' },
];

const MARQUEE_ITEMS = ['Slow-grown', 'Hand-picked', 'Single-origin', 'Honestly-priced', 'Earth-first', 'Forever fresh'];

export default function Home() {
    // One shared request each for products and recipes (also reused by Shop, Box Builder and Recipes).
    const { data: products } = useCached(keys.products, getProducts);
    const { data: allRecipes } = useCached(keys.recipes, getRecipes);
    const featured = useMemo(() => (products || []).filter((p) => p.featured), [products]);
    const recipes = useMemo(() => (allRecipes || []).slice(0, 3), [allRecipes]);
    const countIn = (cat) => (products || []).filter((p) => p.category === cat).length;

    return (
        <>
            {/* ===== HERO ===== */}
            <section className="hero">
                <motion.div
                    className="hero-text"
                    initial="hidden"
                    animate="show"
                    variants={stagger}
                >
                    <motion.div variants={fade} className="hero-eyebrow">
                        Farm to door · Since 2018
                    </motion.div>
                    <motion.h1 variants={fade} className="hero-title">
                        Eat <em>well</em>,<br />
                        live <span className="scribble">slowly</span>,<br />
                        honour the <em>earth</em>.
                    </motion.h1>
                    <motion.p variants={fade} className="hero-sub">
                        Premium organic produce hand-picked from family farms across India. Slow-grown, never refrigerated before reaching you, and priced honestly.
                    </motion.p>
                    <motion.div variants={fade} className="hero-ctas">
                        <Link to="/box-builder" className="btn btn-primary btn-lg">Build a Box →</Link>
                        <Link to="/shop" className="btn btn-outline btn-lg">Shop Pantry</Link>
                    </motion.div>
                    <motion.div variants={fade} className="hero-meta">
                        <div>
                            <div className="hero-meta-num">12<em>k</em>+</div>
                            <div className="hero-meta-label">Happy households</div>
                        </div>
                        <div>
                            <div className="hero-meta-num">38</div>
                            <div className="hero-meta-label">Partner farms</div>
                        </div>
                        <div>
                            <div className="hero-meta-num">100<em>%</em></div>
                            <div className="hero-meta-label">Certified organic</div>
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="hero-visual"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                >
                    <img className="hero-img-1" src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1100&q=85&auto=format&fit=crop" alt="" />
                    <img className="hero-img-2" src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&q=85&auto=format&fit=crop" alt="" />
                    <div className="hero-circle">delivered<br /><em>weekly</em></div>
                    <div className="hero-tag">
                        <span className="dot"></span>
                        Fresh today
                    </div>
                </motion.div>
            </section>

            {/* ===== MARQUEE ===== */}
            <div className="marquee">
                <div className="marquee-track">
                    {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((m, i) => (
                        <span key={i} className="marquee-item">
                            <em>{m}</em>
                            <span className="dot">●</span>
                        </span>
                    ))}
                </div>
            </div>

            {/* ===== CATEGORIES ===== */}
            <section className="section">
                <div className="container">
                    <motion.div
                        className="section-head center"
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={stagger}
                    >
                        <motion.div variants={fade} className="label-mono" style={{ justifyContent: 'center' }}>Section 01 · Categories</motion.div>
                        <motion.h2 variants={fade} className="section-title" style={{ marginTop: 24 }}>
                            Shop by <em>kind.</em>
                        </motion.h2>
                        <motion.p variants={fade} className="section-sub" style={{ margin: '0 auto' }}>
                            Six categories. One hundred and twenty-eight obsessively-sourced items.
                        </motion.p>
                    </motion.div>

                    <div className="cat-grid">
                        {CATEGORIES.map((c, i) => (
                            <motion.div
                                key={c.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.1 }}
                                transition={{ duration: 0.6, delay: i * 0.07 }}
                            >
                                <Link to={`/shop?category=${c.id}`} className="cat-card">
                                    <img src={c.img} alt={c.name} loading="lazy" />
                                    <div>
                                        <div className="cat-card-count">{products ? `${countIn(c.id)} ${countIn(c.id) === 1 ? 'item' : 'items'}` : ' '}</div>
                                        <div className="cat-card-name">{c.name}</div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FEATURED PRODUCTS ===== */}
            <section className="section section-cream">
                <div className="container">
                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={stagger}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 30, marginBottom: 60 }}
                    >
                        <div>
                            <motion.div variants={fade} className="label-mono">Section 02 · Pantry favourites</motion.div>
                            <motion.h2 variants={fade} className="section-title" style={{ marginTop: 24 }}>
                                This <em>week's</em><br />picks.
                            </motion.h2>
                        </div>
                        <motion.div variants={fade}>
                            <Link to="/shop" className="btn btn-outline">Shop All →</Link>
                        </motion.div>
                    </motion.div>

                    <div className="product-grid">
                        {(featured || []).slice(0, 8).map((p, i) => (
                            <ProductCard key={p._id} product={p} index={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== IMAGE BAND — Quote ===== */}
            <section className="image-band">
                <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=2400&q=85&auto=format&fit=crop" alt="" />
                <div className="container image-band-content">
                    <motion.p
                        className="image-band-quote"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.9 }}
                    >
                        "Real food has a <em>season</em>. Real flavour has a <em>place</em>. Real care has a <em>price</em>."
                    </motion.p>
                    <motion.div
                        className="image-band-attr"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        — From the Harvest Manifesto
                    </motion.div>
                </div>
            </section>

            {/* ===== BOX BUILDER PROMO — sage ===== */}
            <section className="section-sage">
                <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="label-mono">Section 03 · Subscriptions</div>
                        <h2 className="section-title" style={{ marginTop: 24, color: 'var(--paper)' }}>
                            Build your own<br /><em>weekly box.</em>
                        </h2>
                        <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontWeight: 300, fontSize: 22, lineHeight: 1.5, color: 'rgba(255,255,255,0.92)', marginTop: 30, marginBottom: 36 }}>
                            Pick exactly what you want. Choose your size, frequency, and delivery day. Skip a week or pause anytime — no questions asked.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40 }}>
                            {[
                                { i: 'fa-leaf', t: 'Pick the produce, set the size' },
                                { i: 'fa-truck-fast', t: 'Free delivery in Mumbai, Pune, Bengaluru' },
                                { i: 'fa-pause', t: 'Pause or skip anytime — no questions asked' },
                                { i: 'fa-rotate', t: 'Save 12% vs. one-time purchase' },
                            ].map((b, i) => (
                                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center', fontSize: 15.5 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                        <i className={`fas ${b.i}`} style={{ color: 'var(--honey)' }}></i>
                                    </div>
                                    {b.t}
                                </div>
                            ))}
                        </div>
                        <Link to="/box-builder" className="btn btn-primary btn-lg">Build a Box →</Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.8 }}
                        style={{ position: 'relative', height: 540 }}
                    >
                        <img
                            src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=900&q=85&auto=format&fit=crop"
                            alt=""
                            style={{ position: 'absolute', top: 0, right: 0, width: '75%', aspectRatio: '4/5', objectFit: 'cover', borderRadius: 14, boxShadow: 'var(--shadow-lg)', border: '8px solid var(--paper)', transform: 'rotate(-3deg)' }}
                        />
                        <img
                            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=85&auto=format&fit=crop"
                            alt=""
                            style={{ position: 'absolute', bottom: '5%', left: 0, width: '55%', aspectRatio: '1', objectFit: 'cover', borderRadius: 14, boxShadow: 'var(--shadow-lg)', border: '8px solid var(--paper)', transform: 'rotate(5deg)' }}
                        />
                        <div style={{
                            position: 'absolute', top: '12%', left: '5%',
                            background: 'var(--honey)', color: 'var(--ink)',
                            width: 110, height: 110, borderRadius: '50%',
                            display: 'grid', placeItems: 'center',
                            fontFamily: 'var(--font-body)', fontStyle: 'italic',
                            fontSize: 14, fontWeight: 500, textAlign: 'center', lineHeight: 1.3,
                            animation: 'spin 16s linear infinite',
                            boxShadow: 'var(--shadow-terra)',
                        }}>save<br /><strong>12%</strong></div>
                    </motion.div>
                </div>
            </section>

            {/* ===== RECIPES ===== */}
            {recipes?.length > 0 && (
                <section className="section">
                    <div className="container">
                        <motion.div
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={stagger}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 30, marginBottom: 60 }}
                        >
                            <div>
                                <motion.div variants={fade} className="label-mono">Section 04 · From the kitchen</motion.div>
                                <motion.h2 variants={fade} className="section-title" style={{ marginTop: 24 }}>
                                    Slow <em>recipes</em>.
                                </motion.h2>
                            </div>
                            <motion.div variants={fade}>
                                <Link to="/recipes" className="btn btn-outline">All Recipes →</Link>
                            </motion.div>
                        </motion.div>

                        <div className="recipe-grid">
                            {recipes.map((r, i) => (
                                <motion.article
                                    key={r._id}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.1 }}
                                    transition={{ duration: 0.7, delay: i * 0.1 }}
                                >
                                    <Link to={`/recipes/${r.slug}`} className="recipe-card">
                                        <div className="recipe-card-img">
                                            <img src={r.coverImage} alt={r.title} loading="lazy" />
                                        </div>
                                        <div className="recipe-card-body">
                                            <div className="recipe-card-meta">
                                                <span>{r.category}</span>
                                                <span>· {r.cookTime} min</span>
                                                <span>· {r.difficulty}</span>
                                            </div>
                                            <h3>{r.title}</h3>
                                            <p>{r.excerpt}</p>
                                            <div className="recipe-card-foot">By {r.author} →</div>
                                        </div>
                                    </Link>
                                </motion.article>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ===== STORY / FARMS ===== */}
            <section className="section section-cream">
                <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 80, alignItems: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="label-mono">Section 05 · Our farms</div>
                        <h2 className="section-title" style={{ marginTop: 24 }}>
                            38 <em>farms</em>.<br />One promise.
                        </h2>
                        <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontWeight: 300, fontSize: 22, lineHeight: 1.5, color: 'var(--ink)', marginTop: 30, marginBottom: 24 }}>
                            We work with thirty-eight family farms across Maharashtra, Karnataka, Kerala, Himachal, and Uttarakhand — each one personally vetted, each one paid above market rate.
                        </p>
                        <p style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.7, marginBottom: 40 }}>
                            We believe great produce comes from healthy soil, fair pay, and patient farming. That is why our food costs more than the supermarket — and why it tastes like food again.
                        </p>
                        <Link to="/about" className="btn btn-outline">Read our story →</Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.8 }}
                        style={{ position: 'relative', height: 580 }}
                    >
                        <img
                            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=900&q=85&auto=format&fit=crop"
                            alt=""
                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14, boxShadow: 'var(--shadow-lg)' }}
                        />
                    </motion.div>
                </div>
            </section>

            {/* ===== FINAL CTA ===== */}
            <section className="section" style={{ textAlign: 'center', padding: '160px 0' }}>
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.7 }}
                    >
                        <div className="label-mono" style={{ justifyContent: 'center', marginBottom: 30 }}>Section 06 · Begin</div>
                        <h2 className="section-title" style={{ marginBottom: 50 }}>
                            Ready to taste<br />the <em>difference</em>?
                        </h2>
                        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/box-builder" className="btn btn-primary btn-lg">Build Your Box →</Link>
                            <Link to="/shop" className="btn btn-outline btn-lg">Browse Shop</Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    );
}
