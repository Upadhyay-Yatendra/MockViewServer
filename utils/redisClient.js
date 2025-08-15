import dotenv from 'dotenv';
dotenv.config();

import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,  // This line is crucial
});

redis.on("connect", () => {
  console.log("\nRedis DB Connected");
});

redis.on("error", (err) => {
  console.error("Redis DB Error:", err);
});

redis.on("close", () => {
  console.log("\nRedis DB Connection Closed");
});

export default redis;

// In summary, for a free-tier, memory-constrained Redis instance, leaving the policy as volatile-lru is a practical choice. You just need to be aware of the potential trade-offs related to job data loss if evictions occur.