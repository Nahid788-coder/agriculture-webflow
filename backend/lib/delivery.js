import { HttpError } from './http.js';

// Cities we deliver to, by the first 3 digits of the pincode.
const ZONES = {
    380: 'Ahmedabad', 382: 'Gandhinagar', 390: 'Vadodara', 395: 'Surat',
    400: 'Mumbai', 410: 'Navi Mumbai', 411: 'Pune', 412: 'Pune',
    560: 'Bengaluru', 110: 'Delhi', 122: 'Gurugram', 201: 'Noida',
    500: 'Hyderabad', 600: 'Chennai', 700: 'Kolkata',
};

export const WINDOWS = [
    { id: 'morning', label: '7 – 10 AM' },
    { id: 'evening', label: '5 – 8 PM' },
];

const DAYS_AHEAD = 4;
const ist = (d, opts) => d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata', ...opts });

/** The next few delivery days (starting tomorrow, India time), each with both time windows. */
function upcomingDays() {
    const out = [];
    for (let i = 1; i <= DAYS_AHEAD; i++) {
        const d = new Date(Date.now() + i * 86400000);
        out.push({
            date: ist(d), // YYYY-MM-DD
            label: d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short' }),
            windows: WINDOWS,
        });
    }
    return out;
}

export function checkPincode(pincode) {
    const pin = String(pincode || '').trim();
    if (!/^[1-9]\d{5}$/.test(pin)) return { ok: false, message: 'Enter a valid 6-digit pincode.' };
    const city = ZONES[pin.slice(0, 3)];
    if (!city) return { ok: false, message: 'We do not deliver to this pincode yet.' };
    return { ok: true, pincode: pin, city, days: upcomingDays() };
}

/** Validates the chosen slot for an order and returns what to store on it. */
export function resolveSlot(pincode, slot) {
    const check = checkPincode(pincode);
    if (!check.ok) throw new HttpError(400, check.message);
    const day = check.days.find((d) => d.date === slot?.date);
    const win = WINDOWS.find((w) => w.id === slot?.window);
    if (!day || !win) throw new HttpError(400, 'Please pick a delivery slot.');
    return { city: check.city, slot: { date: day.date, window: win.id, label: `${day.label}, ${win.label}` } };
}

/** Next delivery date for a subscription, from a starting date. */
export function addInterval(date, frequency) {
    const d = new Date(date);
    if (frequency === 'monthly') d.setMonth(d.getMonth() + 1);
    else d.setDate(d.getDate() + (frequency === 'biweekly' ? 14 : 7));
    return d;
}

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
export function nextWeekday(dayName, from = new Date()) {
    const target = DAY_NAMES.indexOf(dayName);
    const d = new Date(from);
    let add = (target - d.getDay() + 7) % 7;
    if (add === 0) add = 7;
    d.setDate(d.getDate() + add);
    d.setHours(9, 0, 0, 0);
    return d;
}
