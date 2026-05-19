import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFetch } from '../hooks/useFetch';

export default function RecipeDetail() {
    const { slug } = useParams();
    const { data: r, loading } = useFetch(`/recipes/${slug}`);

    if (loading) return (
        <div className="section" style={{ paddingTop: 130 }}>
            <div className="container">
                <div className="skel" style={{ height: 60, width: '70%', marginBottom: 30 }}></div>
                <div className="skel" style={{ height: '50vh', borderRadius: 14 }}></div>
            </div>
        </div>
    );

    if (!r) return (
        <div style={{ padding: 130, textAlign: 'center' }}>
            <h2 style={{ fontSize: 48 }}>Recipe not found</h2>
            <Link to="/recipes" className="btn btn-primary" style={{ marginTop: 30 }}>Back</Link>
        </div>
    );

    return (
        <article className="section" style={{ paddingTop: 130 }}>
            <div className="container" style={{ maxWidth: 980 }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ textAlign: 'center', marginBottom: 50 }}
                >
                    <div className="label-mono" style={{ justifyContent: 'center' }}>{r.category} · {r.cookTime} min · {r.difficulty}</div>
                    <h1 style={{ fontSize: 'clamp(48px, 7vw, 110px)', fontWeight: 400, letterSpacing: '-0.04em', lineHeight: 0.95, marginTop: 18, marginBottom: 24, fontFamily: 'Fraunces, serif' }}>
                        {r.title}
                    </h1>
                    <p style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 300, fontSize: 22, color: 'var(--ink-2)', maxWidth: 720, margin: '0 auto', lineHeight: 1.4 }}>
                        {r.excerpt}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', borderRadius: 18, marginBottom: 60, boxShadow: 'var(--shadow-lg)' }}
                >
                    <img src={r.coverImage} alt={r.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 60, alignItems: 'flex-start' }}>
                    <div style={{ position: 'sticky', top: 100 }}>
                        <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 500, marginBottom: 22, letterSpacing: '-0.02em' }}>Ingredients</h3>
                        <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 18 }}>Serves {r.servings}</p>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {r.ingredients?.map((ing, i) => (
                                <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 15, lineHeight: 1.5, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                    <i className="fas fa-leaf" style={{ color: 'var(--sage)', fontSize: 11, marginTop: 5 }}></i>
                                    {ing}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 500, marginBottom: 26, letterSpacing: '-0.02em' }}>Method</h3>
                        <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 24 }}>
                            {r.steps?.map((s, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{ duration: 0.5, delay: i * 0.05 }}
                                    style={{ display: 'grid', gridTemplateColumns: '50px 1fr', gap: 18, alignItems: 'flex-start' }}
                                >
                                    <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 36, fontWeight: 500, color: 'var(--sage)', lineHeight: 1 }}>0{i + 1}</div>
                                    <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--ink), font-family: Fraunces, serif' }}>{s}</p>
                                </motion.li>
                            ))}
                        </ol>
                    </div>
                </div>

                <div style={{ marginTop: 100, padding: '50px 0', borderTop: '1.5px solid var(--border)', textAlign: 'center' }}>
                    <Link to="/recipes" className="btn btn-outline">← Back to recipes</Link>
                </div>
            </div>
        </article>
    );
}
