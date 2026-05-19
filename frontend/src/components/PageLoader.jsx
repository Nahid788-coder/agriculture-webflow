export default function PageLoader({ gone }) {
    return (
        <div className={`page-loader ${gone ? 'gone' : ''}`}>
            <div className="loader-mark">Harvest <em>Co.</em></div>
            <div className="loader-bar"></div>
        </div>
    );
}
