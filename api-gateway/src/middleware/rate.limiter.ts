import rateLimit from "express-rate-limit";

const commonOptions = {
    windowMs: 10 * 60 * 1000, // 10 minutes
    standardHeaders: "draft-7" as const,
    legacyHeaders: false,
    statusCode: 429,
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
};

export const authLimiter = rateLimit({
    ...commonOptions,
    limit: 10,
    skip: (req) => {
        return ["/:id", "/profile"].includes(req?.path);
    },
});

export const marketLimiter = rateLimit({
    ...commonOptions,
    limit: 1000,
});

export const notificationLimiter = rateLimit({
    ...commonOptions,
    limit: 100,
});

export const orderLimiter = rateLimit({
    ...commonOptions,
    limit: 200,
});

export const portfolioLimiter = rateLimit({
    ...commonOptions,
    limit: 300,
});

export const walletLimiter = rateLimit({
    ...commonOptions,
    limit: 150,
});