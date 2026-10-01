export class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

/** Wraps an async route so thrown errors (including HttpError) reach the error handler. */
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const isId = (v) => typeof v === 'string' && /^[a-f0-9]{24}$/i.test(v);

export const round2 = (n) => Math.round(n * 100) / 100;
