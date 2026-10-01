// Resets the catalog to the sample products and recipes. Usage: npm run seed
import 'dotenv/config';
import mongoose from 'mongoose';
import { ensureSeed } from './lib/seedData.js';

await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB || 'harvest' });
await ensureSeed({ resetCatalog: true });
console.log('Catalog reset.');
await mongoose.disconnect();
