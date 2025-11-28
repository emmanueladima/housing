import rateLimit from 'express-rate-limit';

export const messageLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too many messages sent from this IP, please try again after 15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const threadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // Limit each IP to 50 thread creations per hour
    message: {
        success: false,
        error: 'Too many threads created from this IP, please try again after an hour'
    }
});
