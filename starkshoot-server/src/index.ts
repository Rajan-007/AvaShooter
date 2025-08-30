import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { env } from './config/env';
import cors from 'cors';
import apiRoutes from './routes/api';
import contractRoutes from './routes/contractRoutes';
import purchaseRoutes from './routes/purchaseRoutes';
import avalancheRoutes from './routes/avalancheRoutes';

dotenv.config();

// Check environment before starting
console.log('🔍 Environment check...');
console.log(`📊 MongoDB URI: ${env.mongoUri}`);
console.log(`🔗 Contract features: ${env.hasContractConfig ? 'Enabled' : 'Disabled'}`);
console.log(`❄️  Avalanche features: ${env.hasAvalancheConfig ? 'Enabled' : 'Disabled'}`);

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
  credentials: true
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  console.log(`📋 Headers:`, req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📦 Body:`, req.body);
  }
  next();
});

app.use(express.json());

// Connect to database
connectDB();

// Routes
app.use('/api', apiRoutes);
app.use('/api', contractRoutes);
app.use('/api', purchaseRoutes);
app.use('/api/avalanche', avalancheRoutes);

app.get('/', (req, res) => {
  res.send('Hello from TypeScript Server!');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API available at http://localhost:${PORT}/api`);
  console.log(`🔒 CORS enabled for localhost:3000 and localhost:3001`);
  console.log(`❄️  Avalanche API available at http://localhost:${PORT}/api/avalanche`);
});