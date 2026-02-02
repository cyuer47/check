import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

/**
 * Authentication middleware using JWT
 */
export const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = jwt.verify(token, config.secret);
      req.user = decoded;
      next();
    } catch (jwtError) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, config.secret);
        req.user = decoded;
      } catch (jwtError) {
        // Token invalid but we continue without user
        req.user = null;
      }
    } else {
      req.user = null;
    }
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    req.user = null;
    next();
  }
};

/**
 * Admin check middleware (requires auth middleware first)
 */
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
};

/**
 * Teacher check middleware (requires auth middleware first)
 */
export const teacherOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'teacher' && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Teacher access required' });
  }
  
  next();
};

/**
 * Generate JWT token
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, config.secret, {
    expiresIn: '24h',
    issuer: 'overhoorer',
    audience: 'overhoorer-users'
  });
};

/**
 * Verify JWT token (utility function)
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.secret);
  } catch (error) {
    return null;
  }
};
