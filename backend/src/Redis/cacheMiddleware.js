import redis from "redis";

const client = redis.createClient();

client.on("error", (err) => console.error("Redis Client Error:", err));

// Redis connect on startup
await client.connect();

export const cacheMiddleware = async (req, res, next) => {
  try {
    const cacheKey = `userProfile:${req.params.id}`;
    const cachedData = await client.get(cacheKey);

    if (cachedData) {
      console.log(` Serving from Redis cache: ${cacheKey}`);
      return res.json(JSON.parse(cachedData));
    }

    // Overwrite res.json to cache data before sending
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      await client.setEx(cacheKey, 300, JSON.stringify(data)); // TTL = 5 min
      originalJson(data);
    };

    next();
  } catch (error) {
    console.error("Redis Cache Error:", error);
    next();
  }
};

export default client; 
