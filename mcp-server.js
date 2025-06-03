#!/usr/bin/env node

import TwilioDeepgramMCPServer from "./src/mcp/server.js";
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } from "./src/config/dotenv.js";
import { logger } from "./src/mcp/logger.js";

async function main() {
  const server = new TwilioDeepgramMCPServer();
  await server.run();
  logger.info("", { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER });
}

main().catch((error) => {
  console.error("Failed to start MCP server:", error);
  process.exit(1);
});
