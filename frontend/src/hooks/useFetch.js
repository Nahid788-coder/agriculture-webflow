import { useEffect, useState, useCallback, useRef } from 'react';
import api from '../api/axios';

export function useFetch(url, { skip = false, deps = [] } = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(!skip);
    const [error, setError] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);
    const ctrlRef = useRef(null);

    useEffect(() => {
        if (skip || !url) {
            setLoading(false);
            return;
        }
        const ctrl = new AbortController();
        ctrlRef.current = ctrl;
        setLoading(true);
        setError(null);
        api.get(url, { signal: ctrl.signal })
            .then((r) => { setData(r.data); setLoading(false); })
            .catch((err) => {
                if (err.code === 'ERR_CANCELED' || err.name === 'CanceledError') return;
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            });
        return () => ctrl.abort();
    }, [url, skip, reloadKey, ...deps]);

    const refetch = useCallback(() => setReloadKey((k) => k + 1), []);
    return { data, loading, error, refetch, setData };
}

export function useMutation(url, method = 'POST') {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const mutate = useCallback(async (body, opts = {}) => {
        setLoading(true);
        setError(null);
        try {
            const finalUrl = opts.url || url;
            const res = await api({ url: finalUrl, method, data: body });
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [url, method]);

    return { mutate, loading, error };
}
