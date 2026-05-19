import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <h2 className="footer-headline">
                    Eat <em>well</em>.<br />
                    Live <em>slowly</em>.<br />
                    Honour the <em>earth</em>.
                </h2>

                <div className="footer-cta">
                    <Link to="/box-builder" className="btn btn-primary">Build a Box →</Link>
                    <Link to="/shop" className="btn btn-outline">Shop Pantry</Link>
                </div>

                <div className="footer-cols">
                    <div className="footer-brand">
                        <Link to="/" className="brand" style={{ color: 'var(--paper)' }}>
                            <span className="brand-leaf">🌱</span>
                            Harvest <em style={{ color: 'var(--honey)' }}>Co.</em>
                        </Link>
                        <p>Slow-grown, hand-picked, honestly priced. Organic produce delivered weekly from family farms across India.</p>
                    </div>

                    <div className="footer-col">
                        <h5>Shop</h5>
                        <Link to="/shop?category=vegetables">Vegetables</Link>
                        <Link to="/shop?category=fruits">Fruits</Link>
                        <Link to="/shop?category=pantry">Pantry</Link>
                        <Link to="/shop?category=dairy">Dairy</Link>
                        <Link to="/shop?category=bakery">Bakery</Link>
                    </div>

                    <div className="footer-col">
                        <h5>Discover</h5>
                        <Link to="/box-builder">Build a Box</Link>
                        <Link to="/recipes">Recipes</Link>
                        <Link to="/about">Our Farms</Link>
                        <Link to="/about">Sustainability</Link>
                    </div>

                    <div className="footer-col">
                        <h5>Reach Us</h5>
                        <p>hello@harvestco.farm</p>
                        <p>+91 22 4567 8910</p>
                        <p>Mumbai · Pune · Bengaluru</p>
                    </div>
                </div>

                <div className="footer-bottom">
                    <span>© 2026 Harvest Co.</span>
                    <span>India Organic · PGS-Verified</span>
                    <span>Made with care</span>
                </div>
            </div>
        </footer>
    );
}
