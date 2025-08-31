import { Request, Response } from 'express';
import Purchase from '../models/Purchase';

// Create a new purchase
export const createPurchase = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🛒 Purchase request received:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body
    });
    
    const { type, name, price, image, userId } = req.body;
    
    console.log('📦 Purchase data:', { type, name, price, image, userId });
    
    // Validate required fields
    if (!type || !name || !price) {
      console.log('❌ Missing required fields');
      res.status(400).json({
        success: false,
        message: 'Missing required fields: type, name, and price are required'
      });
      return;
    }
    
    const purchase = new Purchase({
      type,
      name,
      price,
      image: image || 'default.jpg',
      userId: userId || 'anonymous'
    });
    
    console.log('💾 Saving purchase to database:', purchase);
    
    await purchase.save();
    
    console.log('✅ Purchase saved successfully:', purchase._id);
    
    res.status(201).json({
      success: true,
      data: purchase,
      message: 'Purchase recorded successfully'
    });
  } catch (error) {
    console.error('❌ Error creating purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record purchase',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all purchases
export const getPurchases = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📋 Get purchases request received');
    
    const purchases = await Purchase.find().sort({ purchasedAt: -1 });
    
    console.log(`✅ Found ${purchases.length} purchases`);
    
    res.status(200).json({
      success: true,
      data: purchases
    });
  } catch (error) {
    console.error('❌ Error fetching purchases:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchases',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
