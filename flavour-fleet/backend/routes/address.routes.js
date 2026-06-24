import express from 'express';
import { listAddresses, createAddress, deleteAddress } from '../controllers/address.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

router.get('/', listAddresses);
router.post('/', createAddress);
router.delete('/:id', deleteAddress);

export default router;
