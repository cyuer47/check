import bcrypt from 'bcrypt';
import { db } from './database.js';
import { generateToken, verifyToken } from '../middleware/auth.js';
import { config } from '../config/index.js';

/**
 * Authentication service - handles user authentication and authorization
 */
class AuthService {
  /**
   * Register a new user
   */
  async register(userData) {
    const { naam, email, password, role = 'teacher' } = userData;
    
    // Check if user already exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const userId = await db.createUser({
      naam,
      email,
      password: hashedPassword,
      role
    });
    
    // Get created user
    const user = await db.getUserById(userId);
    
    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      naam: user.naam,
      role: user.role,
      isAdmin: user.role === 'admin'
    });
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      token
    };
  }

  /**
   * Login user
   */
  async login(email, password) {
    // Find user by email
    const user = await db.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }
    
    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      naam: user.naam,
      role: user.role,
      isAdmin: user.role === 'admin'
    });
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      token
    };
  }

  /**
   * Verify token and get user
   */
  async verifyToken(token) {
    try {
      const decoded = verifyToken(token);
      if (!decoded) {
        throw new Error('Invalid token');
      }
      
      // Get fresh user data
      const user = await db.getUserById(decoded.id);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      return userWithoutPassword;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Update user password
   */
  async updatePassword(userId, currentPassword, newPassword) {
    // Get user
    const user = await db.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }
    
    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    const updated = await db.updateUser(userId, { password: hashedNewPassword });
    if (!updated) {
      throw new Error('Failed to update password');
    }
    
    return true;
  }

  /**
   * Change user password (admin function)
   */
  async changePassword(userId, newPassword) {
    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    const updated = await db.updateUser(userId, { password: hashedPassword });
    if (!updated) {
      throw new Error('Failed to update password');
    }
    
    return true;
  }

  /**
   * Get user profile
   */
  async getProfile(userId) {
    const user = await db.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, profileData) {
    // Remove password from profile data (should be handled separately)
    const { password, ...profileDataWithoutPassword } = profileData;
    
    // Update user
    const updated = await db.updateUser(userId, profileDataWithoutPassword);
    if (!updated) {
      throw new Error('Failed to update profile');
    }
    
    // Get updated user
    const user = await db.getUserById(userId);
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
  }

  /**
   * Search public profiles
   */
  async searchProfiles(query, limit = 10, offset = 0) {
    const profiles = await db.searchPublicProfiles(query, limit, offset);
    
    // Remove sensitive information
    return profiles.map(profile => ({
      id: profile.id,
      naam: profile.naam,
      avatar: profile.avatar,
      bio: profile.bio,
      is_public: profile.is_public
    }));
  }

  /**
   * Check if user has permission for resource
   */
  async checkPermission(userId, resourceType, resourceId, action = 'read') {
    const user = await db.getUserById(userId);
    if (!user) {
      return false;
    }
    
    // Admin has all permissions
    if (user.role === 'admin') {
      return true;
    }
    
    switch (resourceType) {
      case 'klas':
        return await this.checkKlasPermission(user, resourceId, action);
      case 'vragenlijst':
        return await this.checkVragenlijstPermission(user, resourceId, action);
      case 'sessie':
        return await this.checkSessiePermission(user, resourceId, action);
      default:
        return false;
    }
  }

  /**
   * Check class permission
   */
  async checkKlasPermission(user, klasId, action) {
    const klas = await db.getKlasById(klasId);
    if (!klas) {
      return false;
    }
    
    // Only the teacher who owns the class can manage it
    return klas.docent_id === user.id;
  }

  /**
   * Check question list permission
   */
  async checkVragenlijstPermission(user, vragenlijstId, action) {
    const vragenlijst = await db.getVragenlijstById(vragenlijstId);
    if (!vragenlijst) {
      return false;
    }
    
    // Check if user owns the class that contains this question list
    return await this.checkKlasPermission(user, vragenlijst.klas_id, action);
  }

  /**
   * Check session permission
   */
  async checkSessiePermission(user, sessieId, action) {
    const sessie = await db.getSessieById(sessieId);
    if (!sessie) {
      return false;
    }
    
    // Only the teacher who started the session can manage it
    return sessie.docent_id === user.id;
  }

  /**
   * Validate user session
   */
  async validateSession(userId) {
    try {
      const user = await this.getProfile(userId);
      return {
        valid: true,
        user
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Generate session token for SSE
   */
  async generateSessionToken(userId, sessionId) {
    const payload = {
      id: userId,
      sessionId: sessionId,
      type: 'sse',
      timestamp: Date.now()
    };
    
    return generateToken(payload);
  }

  /**
   * Validate SSE token
   */
  async validateSSEToken(token) {
    try {
      const decoded = verifyToken(token);
      if (!decoded || decoded.type !== 'sse') {
        throw new Error('Invalid SSE token');
      }
      
      // Check if token is not too old (1 hour)
      const tokenAge = Date.now() - decoded.timestamp;
      if (tokenAge > 60 * 60 * 1000) {
        throw new Error('Token expired');
      }
      
      return decoded;
    } catch (error) {
      throw new Error('Invalid SSE token');
    }
  }
}

// Create singleton instance
export const authService = new AuthService();

export default authService;
