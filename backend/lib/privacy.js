// The public demo admin sees real activity, but never customers' contact details.

export const shortName = (name = '') => {
    const [first = '', last = ''] = String(name).trim().split(/\s+/);
    return last ? `${first} ${last[0]}.` : first;
};

const maskPhone = (p = '') => (p ? `${'•'.repeat(Math.max(0, String(p).length - 4))}${String(p).slice(-4)}` : '');
const maskEmail = (e = '') => (e ? `${e[0]}•••@${e.split('@')[1] || ''}` : '');

export const maskOrder = (o) => ({
    ...o,
    customerName: shortName(o.customerName),
    customerPhone: maskPhone(o.customerPhone),
    customerEmail: maskEmail(o.customerEmail),
    shippingAddress: { city: o.shippingAddress?.city, pincode: o.shippingAddress?.pincode?.slice(0, 3) + '•••' },
    notes: o.notes ? '(hidden)' : '',
});

export const maskSubscription = (s) => ({
    ...s,
    customerName: shortName(s.customerName),
    customerPhone: maskPhone(s.customerPhone),
    customerEmail: maskEmail(s.customerEmail),
    shippingAddress: { city: s.shippingAddress?.city },
});
