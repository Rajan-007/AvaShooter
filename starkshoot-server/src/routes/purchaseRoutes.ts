import express from 'express';
import { createPurchase, getPurchases } from '../controllers/purchaseController';

const router = express.Router();

// POST /api/purchases - Create a new purchase
router.post('/purchases', createPurchase);

// GET /api/purchases - Get all purchases
router.get('/purchases', getPurchases);

export default router;
