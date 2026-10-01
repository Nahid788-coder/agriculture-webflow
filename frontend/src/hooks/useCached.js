import { useEffect, useState } from 'react';
import { peek } from '../api/store';
import { errorMessage } from '../api/axios';

/**
 * Reads shared, cached data: useCached(keys.products, getProducts).
 * Renders instantly from the cache when possible and never starts a duplicate request.
 */
export function useCached(key, load) {
    const [state, setState] = useState(() => {
        const data = key ? peek(key) : undefined;
        return { key, data, loading: Boolean(key) && data === undefined, error: null };
    });

    // A different key (e.g. another product page): show cached data or a loader right away.
    if (state.key !== key) {
        const data = key ? peek(key) : undefined;
        setState({ key, data, loading: Boolean(key) && data === undefined, error: null });
    }

    useEffect(() => {
        if (!key) return undefined;
        let alive = true;
        load()
            .then((data) => alive && setState({ key, data, loading: false, error: null }))
            .catch((err) => alive && setState({ key, data: undefined, loading: false, error: errorMessage(err) }));
        return () => { alive = false; };
        // load is tied to key
         
    }, [key]);

    return state;
}
