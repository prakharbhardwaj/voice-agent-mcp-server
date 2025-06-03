import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const PORT = process.env.PORT || 3000;
export const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
export const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
