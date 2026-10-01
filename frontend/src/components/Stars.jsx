export default function Stars({ value = 0, size = 13 }) {
    return (
        <span className="stars" style={{ fontSize: size }} aria-label={`${value} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((n) => (
                <i key={n} className={`fa-star ${value >= n - 0.25 ? 'fas' : value >= n - 0.75 ? 'fas fa-star-half-stroke' : 'far'}`}></i>
            ))}
        </span>
    );
}
