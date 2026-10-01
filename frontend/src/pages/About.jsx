import { motion } from 'framer-motion';

export default function About() {
    return (
        <>
            <header className="page-title-bar">
                <div className="container">
                    <div className="label-mono">Our story · Since 2018</div>
                    <h1 style={{ marginTop: 18 }}>Eat <em>well.</em><br />Live <em>slowly.</em></h1>
                    <p>Eight years. Thirty-eight farms. Twelve thousand households. One conviction.</p>
                </div>
            </header>

            <section className="section">
                <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 80, alignItems: 'flex-start' }}>
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.7 }}
                    >
                        <div className="label-mono">Section 01 · Manifesto</div>
                        <h2 className="section-title" style={{ marginTop: 24 }}>The <em>old</em><br />way back.</h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                    >
                        <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontWeight: 300, fontSize: 26, lineHeight: 1.4, color: 'var(--ink)', marginBottom: 30 }}>
                            We started Harvest Co. in a frustrated kitchen. The tomatoes had no flavour. The mangoes were cold. The farmers were paid badly.
                        </p>
                        <p style={{ fontSize: 17, color: 'var(--ink-2)', lineHeight: 1.75, marginBottom: 20 }}>
                            So we found small family farms — the ones still doing it the old way. Slow-growing. Soil-first. Manual harvesting. We paid them above market rate, and brought their produce directly to households without the cold chain that strips out flavour.
                        </p>
                        <p style={{ fontSize: 17, color: 'var(--ink-2)', lineHeight: 1.75 }}>
                            We're not a startup pretending to care. We're a small business that genuinely does. And every Tuesday morning, when the trucks come in from Lonavla and Coorg and Himachal, we still feel lucky to do this work.
                        </p>
                    </motion.div>
                </div>
            </section>

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
                        "We pay our <em>farmers</em> fifty percent more than the supermarket would. The food costs more. It tastes <em>like food</em> again."
                    </motion.p>
                </div>
            </section>

            <section className="section section-cream">
                <div className="container">
                    <div className="section-head center">
                        <div className="label-mono" style={{ justifyContent: 'center' }}>Section 02 · By the numbers</div>
                        <h2 className="section-title" style={{ marginTop: 24 }}>Eight years.<br /><em>Numbers.</em></h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, borderTop: '1.5px solid var(--border)', borderLeft: '1.5px solid var(--border)', background: 'var(--paper)', borderRadius: 14, overflow: 'hidden' }}>
                        {[
                            { v: '38', l: 'Family farms' },
                            { v: '12k+', l: 'Households served' },
                            { v: '50%', l: 'Above market pay' },
                            { v: '4hr', l: 'Farm to door' },
                            { v: '0', l: 'Cold-chain steps' },
                            { v: '128', l: 'Items in catalogue' },
                            { v: '94%', l: 'Customer return rate' },
                            { v: '8y', l: 'Years on this' },
                        ].map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
                                style={{ padding: 36, borderRight: '1.5px solid var(--border)', borderBottom: '1.5px solid var(--border)' }}
                            >
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 0.9, marginBottom: 10 }}>{s.v}</div>
                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--ink-3)' }}>{s.l}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section-sage">
                <div className="container" style={{ textAlign: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="label-mono" style={{ justifyContent: 'center' }}>Section 03 · Visit us</div>
                        <h2 className="section-title" style={{ marginTop: 24, color: 'var(--paper)' }}>
                            Mumbai · Pune · Bengaluru.<br /><em>Drop by anytime.</em>
                        </h2>
                        <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontWeight: 300, fontSize: 22, color: 'rgba(255,255,255,0.85)', maxWidth: 620, margin: '24px auto 40px', lineHeight: 1.5 }}>
                            Our showrooms-cum-cafés are open seven days a week. Come for coffee, leave with a basket.
                        </p>
                    </motion.div>
                </div>
            </section>
        </>
    );
}
