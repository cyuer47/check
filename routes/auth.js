import express from 'express';
import { authService } from '../services/auth.js';
import { validate, userRegistrationSchema, userLoginSchema, userUpdateSchema } from '../utils/validation.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Register new user
 * POST /api/auth/register
 */
router.post('/register', validate(userRegistrationSchema), async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error.message === 'User with this email already exists') {
      return res.status(409).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * Login user
 * POST /api/auth/login
 */
router.post('/login', validate(userLoginSchema), async (req, res, next) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.json(result);
  } catch (error) {
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * Get current user profile
 * GET /api/auth/profile
 */
router.get('/profile', auth, async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

/**
 * Update user profile
 * PUT /api/auth/profile
 */
router.put('/profile', auth, validate(userUpdateSchema), async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

/**
 * Update password
 * PUT /api/auth/password
 */
router.put('/password', auth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    await authService.updatePassword(req.user.id, currentPassword, newPassword);
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    if (error.message === 'Current password is incorrect') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * Validate token
 * GET /api/auth/validate
 */
router.get('/validate', auth, async (req, res, next) => {
  try {
    const result = await authService.validateSession(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Search public profiles
 * GET /api/auth/search
 */
router.get('/search', async (req, res, next) => {
  try {
    const { q, limit = 10, offset = 0 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const profiles = await authService.searchProfiles(q, parseInt(limit), parseInt(offset));
    res.json({ profiles });
  } catch (error) {
    next(error);
  }
});

/**
 * Logout (client-side only - token invalidation would require token blacklist)
 * POST /api/auth/logout
 */
router.post('/logout', auth, (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // For server-side logout, you would need a token blacklist
  res.json({ message: 'Logout successful' });
});

export default router;
