import { config } from '../config/index.js';

/**
 * CORS middleware
 */
export const cors = (req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = Array.isArray(config.cors.origin) 
    ? config.cors.origin 
    : [config.cors.origin];

  // Set CORS headers
  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
};

/**
 * Rate limiting middleware
 */
export const rateLimit = (options = {}) => {
  const windowMs = options.windowMs || config.rateLimit.windowMs;
  const max = options.max || config.rateLimit.max;
  
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    if (requests.has(key)) {
      const userRequests = requests.get(key).filter(time => time > windowStart);
      requests.set(key, userRequests);
    }

    // Check rate limit
    const userRequests = requests.get(key) || [];
    if (userRequests.length >= max) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Add current request
    userRequests.push(now);
    requests.set(key, userRequests);

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - userRequests.length));
    res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

    next();
  };
};

/**
 * Request logging middleware
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`${req.method} ${req.path} - ${req.ip} - ${new Date().toISOString()}`);
  
  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

/**
 * Error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Don't leak error details in production
  const isDevelopment = config.nodeEnv === 'development';
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: isDevelopment ? err.details : undefined
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized'
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    error: isDevelopment ? err.message : 'Internal server error',
    details: isDevelopment ? err.stack : undefined
  });
};

/**
 * 404 handler middleware
 */
export const notFound = (req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method
  });
};
