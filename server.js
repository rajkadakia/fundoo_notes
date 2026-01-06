import app from './src/app.js';
import connectDB from './src/config/db.js';
import { connectRedis } from './src/config/redis.config.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

connectDB();
connectRedis();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

