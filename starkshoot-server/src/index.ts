import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import cors from 'cors';
import apiRoutes from './routes/api';
import contractRoutes from './routes/contractRoutes';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
connectDB();

app.use('/api', apiRoutes);
app.use('/api', contractRoutes);

app.get('/', (req, res) => {
  res.send('Hello from TypeScript Server!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});