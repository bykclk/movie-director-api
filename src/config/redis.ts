import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  retryStrategy: (times: number) => {
    // Retry up to 3 times with exponential backoff
    if (times <= 3) {
      return Math.min(times * 100, 3000);
    }
    return null;
  },
});

redisClient.on("connect", () => {
  console.log("Redis connected successfully");
});

redisClient.on("error", (err: Error) => {
  console.error("Redis connection error:", err);
});

export default redisClient;
