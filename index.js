import Fastify from "fastify";
import WebSocket from "ws";
import dotenv from "dotenv";
import fastifyFormBody from "@fastify/formbody";
import fastifyWs from "@fastify/websocket";

import { SettingsConfiguration } from "./SettingsConfiguration.js";
import { getWeatherFromCityName } from "./functionCall.js";

// Load environment variables from .env file
dotenv.config();

// Initialize Fastify server
const fastify = Fastify();
fastify.register(fastifyFormBody);
fastify.register(fastifyWs);

// Define server port
const PORT = process.env.PORT || 3000;

// Option to display elapsed timing calculations
const SHOW_TIMING_MATH = false;

// Root route: Health check
fastify.get("/", async (request, reply) => {
  reply.send({ message: "Twilio Media Stream Server is running!" });
});

// Handle incoming calls from Twilio
fastify.all("/incoming", async (request, reply) => {
  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
                          <Response>
                              <Connect>
                                  <Stream url="wss://${request.headers.host}/media-stream" />
                              </Connect>
                          </Response>`;

  reply.type("text/xml").send(twimlResponse);
});

// WebSocket route for media-stream
fastify.register(async (fastify) => {
  fastify.get("/media-stream", { websocket: true }, (connection, req) => {
    console.log("[WS] Client connected");

    // State variables
    let streamSid = null;
    let latestMediaTimestamp = 0;

    // Initialize DeepGram WebSocket
    const deepgramWs = new WebSocket("wss://agent.deepgram.com/agent", {
      headers: { Authorization: `Token ${process.env.DEEPGRAM_API_KEY}` }
    });

    // Event: DeepGram WebSocket open
    deepgramWs.on("open", () => {
      console.log("[DeepGram] Connected");
      deepgramWs.send(JSON.stringify(SettingsConfiguration));
    });

    // Event: DeepGram WebSocket close
    deepgramWs.on("close", () => {
      console.log("[DeepGram] Disconnected");
    });

    // Event: DeepGram WebSocket error
    deepgramWs.on("error", (error) => {
      console.error("[DeepGram] Error: ", error);
    });

    // Event: DeepGram WebSocket message
    deepgramWs.on("message", async (message, isBinary) => {
      try {
        if (isBinary) {
          // Process binary audio data
          const audioDelta = {
            event: "media",
            streamSid,
            media: { payload: Buffer.from(message).toString("base64") }
          };
          connection.send(JSON.stringify(audioDelta));
          connection.send(JSON.stringify({ event: "mark", streamSid, mark: { name: "responsePart" } }));
        } else {
          // Process JSON messages
          const response = JSON.parse(message);
          switch (response.type) {
            case "SettingsApplied":
              console.log("[DeepGram] Settings applied successfully");
              deepgramWs.send(
                JSON.stringify({
                  type: "InjectAgentMessage",
                  message: "Hello, I am an AI Assistant. I can help you with weather information."
                })
              );
              break;
            case "Welcome":
              console.log("[DeepGram] Welcome message received");
              break;
            case "UserStartedSpeaking":
              console.log("[DeepGram] User started speaking");
              connection.send(JSON.stringify({ event: "clear", streamSid }));
              break;
            case "FunctionCallRequest":
              console.log("[DeepGram] Function call request: ", response);
              if (response.function_name === "getWeatherFromCityName") {
                const weatherInfo = await getWeatherFromCityName(response.input.city, process.env.WEATHER_API_KEY);
                deepgramWs.send(
                  JSON.stringify({
                    type: "FunctionCallResponse",
                    function_call_id: response.function_call_id,
                    output: weatherInfo
                  })
                );
              }
              break;
            default:
              console.log("[DeepGram] Response received: ", response);
          }
        }
      } catch (error) {
        console.error("[DeepGram] Error processing message: ", error, "Message: ", message);
      }
    });

    // Event: Twilio WebSocket message
    connection.on("message", (message) => {
      try {
        const data = JSON.parse(message);
        switch (data.event) {
          case "media":
            latestMediaTimestamp = data.media.timestamp;
            if (SHOW_TIMING_MATH) {
              console.log(`[Twilio] Media event received. Timestamp: ${latestMediaTimestamp}ms`);
            }
            if (deepgramWs.readyState === WebSocket.OPEN) {
              deepgramWs.send(Buffer.from(data.media.payload, "base64"));
            }
            break;
          case "start":
            streamSid = data.start.streamSid;
            console.log("[Twilio] Stream started. SID:", streamSid);
            latestMediaTimestamp = 0;
            break;
          default:
            console.log("[Twilio] Non-media event: ", data.event);
        }
      } catch (error) {
        console.error("[Twilio] Error parsing message: ", error, "Message: ", message);
      }
    });

    // Event: WebSocket connection close
    connection.on("close", () => {
      if (deepgramWs.readyState === WebSocket.OPEN) {
        deepgramWs.close();
      }
      console.log("[WS] Client disconnected");
    });
  });
});

// Start the server
fastify.listen({ port: PORT }, (err) => {
  if (err) {
    console.error("[Server] Startup error: ", err);
    process.exit(1);
  }
  console.log(`[Server] Running on port ${PORT}`);
});
