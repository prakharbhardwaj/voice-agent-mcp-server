import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const PORT = process.env.PORT || 3000;
export const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
export const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
