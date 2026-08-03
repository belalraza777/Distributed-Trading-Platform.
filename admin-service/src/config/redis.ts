import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  username: process.env.REDIS_USERNAME || undefined,
  password: process.env.REDIS_PASSWORD || undefined,

  retryStrategy(times) {
    return Math.min(times * 100, 3000);
  },

  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  lazyConnect: false,
});

redisClient.on("connect", () => {
  console.log("Redis connected");
});

redisClient.on("ready", () => {
  console.log("Redis ready");
});

redisClient.on("reconnecting", () => {
  console.log("Redis reconnecting");
});

redisClient.on("close", () => {
  console.warn("Redis connection closed");
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err.message);
});

export default redisClient;
