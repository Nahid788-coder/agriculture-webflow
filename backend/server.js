// Local development server. On Vercel the same app runs as a function (see /api/index.js).
import 'dotenv/config';
import dns from 'node:dns';

// Opt-in: some networks need public DNS to resolve mongodb+srv records.
if (process.env.DNS_SERVERS) dns.setServers(process.env.DNS_SERVERS.split(','));

const { default: app } = await import('./app.js');
const { connectDb } = await import('./db.js');

const PORT = process.env.PORT || 5005;
await connectDb();
app.listen(PORT, () => console.log(`Harvest API on http://localhost:${PORT}`));
