import mongoose from 'mongoose';
import { ensureSeed } from './lib/seedData.js';

// One connection per server instance, reused across requests (important on serverless).
let pending = null;

export function connectDb() {
    if (mongoose.connection.readyState === 1) return Promise.resolve();
    if (!pending) {
        if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not set');
        pending = mongoose
            // Always its own database, even when MONGO_URI is shared with another project (e.g. Slice & Crust).
            .connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB || 'harvest', serverSelectionTimeoutMS: 8000, maxPoolSize: 5 })
            .then(() => ensureSeed())
            .catch((err) => {
                pending = null;
                throw err;
            });
    }
    return pending;
}
