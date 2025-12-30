import rateLimit from 'express-rate-limit';

// Global rate limiter - 100 requests per minute per IP
export const globalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    message: {
        success: false,
        error: 'Too many requests from this IP, please slow down'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Auth rate limiter - 5 login attempts per 15 minutes (brute force protection)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: {
        success: false,
        error: 'Too many login attempts, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Only count failed attempts
});

// Signup rate limiter - prevent spam account creation
export const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: {
        success: false,
        error: 'Too many accounts created from this IP, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Message rate limiter (existing)
export const messageLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too many messages sent from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Thread rate limiter (existing)
export const threadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // Limit each IP to 50 thread creations per hour
    message: {
        success: false,
        error: 'Too many threads created from this IP, please try again after an hour'
    }
});
