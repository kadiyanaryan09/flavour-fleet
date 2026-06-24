import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as userModel from '../models/userModel.js';

function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, isAdmin: !!user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

export async function register(req, res) {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = await userModel.create({ name, email, passwordHash, phone });
    const user = { id, name, email, isAdmin: false };

    res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    res.status(500).json({ message: 'Could not create account.', error: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const dbUser = await userModel.findByEmail(email);
    if (!dbUser) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }
    if (!dbUser.is_active) {
      return res.status(403).json({ message: 'This account has been deactivated.' });
    }

    const matches = await bcrypt.compare(password, dbUser.password_hash);
    if (!matches) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    const user = { id: dbUser.id, name: dbUser.name, email: dbUser.email, isAdmin: !!dbUser.is_admin };
    res.json({ token: signToken(user), user });
  } catch (err) {
    res.status(500).json({ message: 'Could not log in.', error: err.message });
  }
}

export async function me(req, res) {
  const user = await userModel.findById(req.user.id);
  res.json({ user: { ...user, isAdmin: !!user.is_admin } });
}

export async function updateMe(req, res) {
  try {
    const { name, phone } = req.body;
    await userModel.updateProfile(req.user.id, { name, phone });
    res.json({ message: 'Profile updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not update profile.', error: err.message });
  }
}
