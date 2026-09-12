import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redisClient from "../config/redis";

// Create a Redis store for rate limiting
const redisStore = new RedisStore({
    sendCommand: (command: string, ...args: string[]) =>
        redisClient.call(command, ...args) as Promise<any>,
});

const commonOptions = {
    windowMs: 10 * 60 * 500, // 5 minutes
    standardHeaders: "draft-7" as const,
    legacyHeaders: false,
    statusCode: 429,

    store: redisStore,

    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
};

export const authLimiter = rateLimit({
    ...commonOptions,
    limit: 15,

    skip: (req) => {
        return ["/:id", "/profile"].includes(req.path);
    },
});

export const marketLimiter = rateLimit({
    ...commonOptions,
    limit: 1000,
});

export const notificationLimiter = rateLimit({
    ...commonOptions,
    limit: 1000,
});

export const orderLimiter = rateLimit({
    ...commonOptions,
    limit: 500,
});

export const portfolioLimiter = rateLimit({
    ...commonOptions,
    limit: 500,
});

export const walletLimiter = rateLimit({
  ...commonOptions,
  limit: 500,
});

export const adminLimiter = rateLimit({
  ...commonOptions,
  limit: 10000,
});
