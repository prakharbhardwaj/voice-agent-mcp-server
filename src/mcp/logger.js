/*
 * MCP Server Logger
 * This module provides a simple logging utility for the MCP server.
 * It logs messages to a file named 'mcp-server.log' in the same directory as this module.
 */

import { appendFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LOG_FILE = join(__dirname, "mcp-server.log");

function formatMessage(level, message, data) {
  const timestamp = new Date().toISOString();
  const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : "";
  return `[${timestamp}] [${level}] ${message}${dataStr}\n`;
}

export const logger = {
  info(message, data) {
    const logMessage = formatMessage("INFO", message, data);
    appendFileSync(LOG_FILE, logMessage);
  },

  error(message, error) {
    const logMessage = formatMessage("ERROR", message, error);
    appendFileSync(LOG_FILE, logMessage);
  },

  debug(message, data) {
    const logMessage = formatMessage("DEBUG", message, data);
    appendFileSync(LOG_FILE, logMessage);
  }
};
