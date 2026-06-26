import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import menuRoutes from './routes/menu.routes.js';
import orderRoutes from './routes/order.routes.js';
import restaurantRoutes from './routes/restaurant.routes.js';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Vercel path rewrite fix (preserves original URL path for Express routing)
app.use((req, res, next) => {
  const matchedPath = req.headers['x-matched-path'];
  if (matchedPath) {
    const urlParts = req.url.split('?');
    const queryString = urlParts[1] ? `?${urlParts[1]}` : '';
    req.url = matchedPath + queryString;
  }
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'flavour-fleet-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/restaurants', restaurantRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// Central error handler (catches anything thrown synchronously in routes)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Flavour Fleet API running on http://localhost:${PORT}`);
});

export default app;
