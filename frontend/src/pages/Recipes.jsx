import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFetch } from '../hooks/useFetch';

const CATS = ['all', 'breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink'];

export default function Recipes() {
    const [params, setParams] = useSearchParams();
    const cat = params.get('category') || 'all';
    const url = cat === 'all' ? '/recipes' : `/recipes?category=${cat}`;
    const { data: recipes, loading } = useFetch(url);

    return (
        <>
            <header className="page-title-bar">
                <div className="container">
                    <div className="label-mono">Slow kitchen · Recipes</div>
                    <h1 style={{ marginTop: 18 }}>Slow <em>recipes.</em></h1>
                    <p>Worth-the-effort dishes that honour seasonal produce. Twenty-four recipes in our growing collection.</p>
                </div>
            </header>

            <section className="section">
                <div className="container">
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40 }}>
                        {CATS.map((c) => (
                            <button
                                key={c}
                                onClick={() => {
                                    if (c === 'all') params.delete('category');
                                    else params.set('category', c);
                                    setParams(params);
                                }}
                                className={`builder-filter-pill ${cat === c ? 'active' : ''}`}
                                style={{ textTransform: 'capitalize' }}
                            >
                                {c}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="recipe-grid">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i}>
                                    <div className="skel" style={{ aspectRatio: '16/10', borderRadius: 16 }}></div>
                                </div>
                            ))}
                        </div>
                    ) : recipes?.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--ink-3)', padding: 80, fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 22 }}>No recipes here yet.</p>
                    ) : (
                        <div className="recipe-grid">
                            {recipes?.map((r, i) => (
                                <motion.article
                                    key={r._id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.1 }}
                                    transition={{ duration: 0.6, delay: (i % 3) * 0.08 }}
                                >
                                    <Link to={`/recipes/${r.slug}`} className="recipe-card">
                                        <div className="recipe-card-img">
                                            <img src={r.coverImage} alt={r.title} loading="lazy" />
                                        </div>
                                        <div className="recipe-card-body">
                                            <div className="recipe-card-meta">
                                                <span>{r.category}</span><span>· {r.cookTime}m</span><span>· {r.difficulty}</span>
                                            </div>
                                            <h3>{r.title}</h3>
                                            <p>{r.excerpt}</p>
                                            <div className="recipe-card-foot">By {r.author} →</div>
                                        </div>
                                    </Link>
                                </motion.article>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
