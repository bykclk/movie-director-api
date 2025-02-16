import { connect, NatsConnection } from "nats";

let natsClient: NatsConnection;

export const connectNATS = async (): Promise<void> => {
  try {
    natsClient = await connect({
      servers: process.env.NATS_URL || "nats://localhost:4222",
    });
    console.log("NATS connected successfully");

    // Handle connection close
    natsClient.closed().then((err) => {
      if (err) {
        console.error("NATS connection closed with error:", err);
      }
    });
  } catch (error) {
    console.error("NATS connection error:", error);
    process.exit(1);
  }
};

export const getNatsClient = (): NatsConnection => {
  if (!natsClient) {
    throw new Error("NATS client not initialized");
  }
  return natsClient;
};

// Event types
export const EVENTS = {
  MOVIE_CACHE_CLEAR: "movie.cache.clear",
} as const;
