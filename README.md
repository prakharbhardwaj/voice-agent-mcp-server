# Twilio Media Streams Integration with Deepgram’s Voice Agent API

This project demonstrates integrating Twilio Media Streams with Deepgram’s Voice Agent API to create an AI-powered voice assistant. The system captures real-time audio from a Twilio call, processes it through Deepgram’s AI to generate a response, and streams the response back to the caller.

## Prerequisites

To set up and run the application, you'll need:

- **Node.js**: Requires v18 or more. [Download here](https://nodejs.org/).
- **Twilio Account**: Sign up for a free trial [here](https://www.twilio.com/try-twilio).
- **Twilio Phone Number with Voice Capabilities**: [Purchase one here](https://www.twilio.com/docs/phone-numbers).
- **Deepgram Account**: Obtain an API key by signing up [here](https://console.deepgram.com/).
- **WeatherAPI Account**: Obtain an API key to enable the weather-related function calls. [Sign up here](https://www.weatherapi.com/).

## How to setup locally?

### 1. Open an ngrok tunnel

To expose your local development server, use ngrok:

```
ngrok http 3000
```

Copy the Forwarding URL (e.g., `https://[your-ngrok-subdomain].ngrok.app`) for use in Twilio’s configuration.

Note: If you change the port in the application, update the ngrok command accordingly.

### 2. Install required packages:

```
npm install
```

### 3. Configure the .env File

#### Create a .env file in the root directory and add the following variables:

```
PORT=3000
DEEPGRAM_API_KEY=<YOUR_DEEPGRAM_API_KEY>
WEATHER_API_KEY=<YOUR_WEATHER_API_KEY>
```

#### Configure Twilio Webhooks

Log in to your Twilio console, go to your Phone Numbers settings, and update the webhook URL to point to your `/incoming` endpoint:

```
https://[your-ngrok-subdomain].ngrok.app/incoming
```

## Running the Application

Start the development server:

```
npm run dev
```

With the server running, call your Twilio phone number. Once the call connects, you can interact with the AI-powered voice assistant.

## Project Structure

```
.
├── README.md
├── SettingsConfiguration.js # Contains Deepgram configuration utilities
├── functionCall.js          # Handles AI function calls
├── index.js                 # Main application logic
├── package-lock.json
└── package.json
```

## How It Works

1. **Incoming Calls**: A Twilio webhook forwards the incoming call to the `/incoming` endpoint.
2. **Media Streaming**: Twilio streams the audio to the `/media-stream` WebSocket endpoint.
3. **Deepgram Integration**: The application sends the audio to Deepgram’s Voice Agent API for transcription and response generation.
4. **AI Responses**: Responses are sent back as audio, streamed to the caller via Twilio.

## Medium Article

For a step-by-step guide to building this application, check out our Medium article:

[Building an AI Voice Assistant with Deepgram Voice Agent API and Twilio]()

## Resources

- [Deepgram Voice Agent API Documentation](https://developers.deepgram.com/docs/voice-agent-settings-configuration)
- [Twilio Media Streams Documentation](https://www.twilio.com/docs/voice/twiml/stream)

With this setup, you’re ready to create a fully functional AI-powered voice assistant. Have fun experimenting and building! 🚀
