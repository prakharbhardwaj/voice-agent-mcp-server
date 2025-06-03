import Fastify from "fastify";
import fastifyFormBody from "@fastify/formbody";
import fastifyWs from "@fastify/websocket";

import twilioRoute from "./src/routes/twilioRoute.js";
import mediaStreamHandler from "./src/websockets/mediaStreamHandler.js";

import { PORT } from "./src/config/dotenv.js";

// Initialize Fastify
const fastify = Fastify();
fastify.register(fastifyFormBody);
fastify.register(fastifyWs);

// Register routes
twilioRoute(fastify);
mediaStreamHandler(fastify);

// Start server
fastify.listen({ port: PORT }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server is listening on port ${PORT}`);
});
