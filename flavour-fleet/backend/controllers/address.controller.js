import * as addressModel from '../models/addressModel.js';

export async function listAddresses(req, res) {
  try {
    const addresses = await addressModel.listForUser(req.user.id);
    res.json({ addresses });
  } catch (err) {
    res.status(500).json({ message: 'Could not load addresses.', error: err.message });
  }
}

export async function createAddress(req, res) {
  try {
    const { label, line1, line2, city, state, pincode, isDefault } = req.body;
    if (!line1 || !city || !state || !pincode) {
      return res.status(400).json({ message: 'Address line, city, state and pincode are required.' });
    }
    const id = await addressModel.create(req.user.id, { label, line1, line2, city, state, pincode, isDefault });
    res.status(201).json({ message: 'Address saved.', id });
  } catch (err) {
    res.status(500).json({ message: 'Could not save address.', error: err.message });
  }
}

export async function deleteAddress(req, res) {
  try {
    const ok = await addressModel.remove(req.user.id, req.params.id);
    if (!ok) return res.status(404).json({ message: 'Address not found.' });
    res.json({ message: 'Address deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete address.', error: err.message });
  }
}
