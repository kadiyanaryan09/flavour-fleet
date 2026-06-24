import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length <= 2 ? digits : `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export default function Checkout() {
  const { items, clearCart, refreshCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState('address'); // address | payment
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({ label: 'Home', line1: '', line2: '', city: '', state: '', pincode: '' });
  const [bill, setBill] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/addresses').then(({ data }) => {
      setAddresses(data.addresses);
      const def = data.addresses.find((a) => a.is_default) || data.addresses[0];
      if (def) setSelectedAddressId(def.id);
    });
    api.get('/orders/preview-bill').then(({ data }) => setBill(data));
  }, []);

  const handleContinue = (e) => {
    e.preventDefault();
    if (!selectedAddressId && (!newAddress.line1 || !newAddress.city || !newAddress.state || !newAddress.pincode)) {
      setError('Choose a saved address or fill in a new one.');
      return;
    }
    setError('');
    setStep('payment');
  };

  const handlePay = async (e) => {
    e.preventDefault();
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length !== 16) return setError('Enter a 16-digit card number (mock form — any 16 digits work).');
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return setError('Enter expiry as MM/YY.');
    if (cvv.length < 3) return setError('Enter a 3-4 digit CVV.');

    setError('');
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200)); // simulate gateway latency

    try {
      const payload = selectedAddressId
        ? { addressId: selectedAddressId, cardLast4: digits.slice(-4) }
        : { deliveryAddress: `${newAddress.line1}, ${newAddress.line2 ? newAddress.line2 + ', ' : ''}${newAddress.city}, ${newAddress.state} - ${newAddress.pincode}`, cardLast4: digits.slice(-4) };

      await api.post('/orders', payload);
      await refreshCart();
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return <div className="max-w-md mx-auto px-5 py-16 text-center text-gray-500">Your cart is empty.</div>;
  }

  return (
    <div className="max-w-md mx-auto px-5 py-8">
      <h1 className="font-display font-extrabold text-2xl mb-6">Checkout</h1>

      <div className="flex gap-4 text-sm font-semibold mb-6">
        <span className={step === 'address' ? 'text-fleet-600' : 'text-gray-400'}>1. Address</span>
        <span className={step === 'payment' ? 'text-fleet-600' : 'text-gray-400'}>2. Payment</span>
      </div>

      {error && <p className="bg-red-50 text-chili text-sm rounded-lg p-3 mb-4">{error}</p>}

      {step === 'address' ? (
        <form onSubmit={handleContinue} className="space-y-4">
          {addresses.length > 0 && (
            <div className="space-y-2">
              {addresses.map((a) => (
                <label
                  key={a.id}
                  className={`block border rounded-xl p-3 text-sm cursor-pointer ${
                    selectedAddressId === a.id ? 'border-fleet-500 bg-fleet-50' : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    className="mr-2"
                    checked={selectedAddressId === a.id}
                    onChange={() => setSelectedAddressId(a.id)}
                  />
                  <strong>{a.label}</strong> — {a.line1}, {a.city}, {a.state} - {a.pincode}
                </label>
              ))}
            </div>
          )}

          <details className="text-sm" open={addresses.length === 0}>
            <summary className="cursor-pointer text-fleet-600 font-semibold">
              {addresses.length > 0 ? 'Or use a new address' : 'Add a delivery address'}
            </summary>
            <div className="space-y-3 mt-3">
              <input placeholder="Address line" value={newAddress.line1}
                onChange={(e) => { setNewAddress({ ...newAddress, line1: e.target.value }); setSelectedAddressId(null); }}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm" />
              <div className="flex gap-3">
                <input placeholder="City" value={newAddress.city}
                  onChange={(e) => { setNewAddress({ ...newAddress, city: e.target.value }); setSelectedAddressId(null); }}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm" />
                <input placeholder="State" value={newAddress.state}
                  onChange={(e) => { setNewAddress({ ...newAddress, state: e.target.value }); setSelectedAddressId(null); }}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm" />
                <input placeholder="Pincode" value={newAddress.pincode}
                  onChange={(e) => { setNewAddress({ ...newAddress, pincode: e.target.value }); setSelectedAddressId(null); }}
                  className="w-32 border border-gray-200 rounded-lg px-4 py-2.5 text-sm" />
              </div>
            </div>
          </details>

          <button type="submit" className="w-full bg-fleet-500 text-ink font-bold rounded-full py-3.5">
            Continue to payment
          </button>
        </form>
      ) : (
        <form onSubmit={handlePay} className="space-y-4">
          <p className="text-sm text-gray-500">Mock payment form — no real card is charged.</p>
          <input
            placeholder="4242 4242 4242 4242" value={cardNumber} inputMode="numeric"
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm"
          />
          <div className="flex gap-3">
            <input placeholder="MM/YY" value={expiry} inputMode="numeric"
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm" />
            <input placeholder="CVV" value={cvv} inputMode="numeric"
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm" />
          </div>

          {bill && (
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-sm flex justify-between font-bold">
              <span>To pay</span>
              <span>₹{bill.totalAmount.toFixed(0)}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep('address')} className="flex-1 border border-gray-200 rounded-full py-3 font-semibold text-sm">
              Back
            </button>
            <button type="submit" disabled={submitting} className="flex-1 bg-fleet-500 text-ink font-bold rounded-full py-3 disabled:opacity-60">
              {submitting ? 'Processing…' : `Pay ₹${bill ? bill.totalAmount.toFixed(0) : ''}`}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
