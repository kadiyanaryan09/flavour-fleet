import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'No token provided. Please log in.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      isAdmin: !!payload.isAdmin,
    };
    next();
  } catch {
    return res.status(401).json({ message: 'Session expired or invalid. Please log in again.' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  next();
}
