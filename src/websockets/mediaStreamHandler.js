import WebSocket from "ws";
import { SettingsConfiguration } from "../SettingsConfiguration.js";
import { DEEPGRAM_API_KEY } from "../config/dotenv.js";
import { handleFunctionCall } from "../services/functionCallHandler.js";

export default function mediaStreamHandler(fastify) {
  fastify.register(async (fastify) => {
    fastify.get("/media-stream", { websocket: true }, (connection, req) => {
      console.log("[WS] Client connected");

      // State variables
      let streamSid = null;
      let latestMediaTimestamp = 0;

      // Initialize Deepgram WebSocket
      const deepgramWs = new WebSocket("wss://agent.deepgram.com/v1/agent/converse", {
        headers: {
          Authorization: "Token " + DEEPGRAM_API_KEY
        }
      });

      // Event: Deepgram WebSocket open
      deepgramWs.on("open", () => {
        console.log("[Deepgram] Connected");
        deepgramWs.send(JSON.stringify(SettingsConfiguration));
      });

      // Event: Deepgram WebSocket close
      deepgramWs.on("close", () => {
        console.log("[Deepgram] Disconnected");
      });

      // Event: Deepgram WebSocket error
      deepgramWs.on("error", (error) => {
        console.error("[Deepgram] Error: ", error);
      });

      // Event: Deepgram WebSocket message
      deepgramWs.on("message", async (message, isBinary) => {
        try {
          // Process messages
          if (isBinary) {
            const audioDelta = {
              event: "media",
              streamSid: streamSid,
              media: { payload: Buffer.from(message).toString("base64") }
            };

            connection.send(JSON.stringify(audioDelta));
            connection.send(
              JSON.stringify({
                event: "mark",
                streamSid: streamSid,
                mark: { name: "responsePart" }
              })
            );
          } else {
            // Process JSON messages
            const response = JSON.parse(message);
            switch (response.type) {
              case "SettingsApplied":
                console.log("[Deepgram] Settings applied successfully");
                deepgramWs.send(
                  JSON.stringify({
                    type: "InjectAgentMessage",
                    content: "Hello, I am an AI Assistant. I can help you with weather information."
                  })
                );
                break;
              case "Welcome":
                console.log("[Deepgram] Welcome message received");
                break;
              case "UserStartedSpeaking":
                console.log("[Deepgram] User started speaking");
                connection.send(JSON.stringify({ event: "clear", streamSid }));
                break;
              case "FunctionCallRequest":
                console.log("[Deepgram] Function call request: ", response);
                await handleFunctionCall(response.functions, deepgramWs);
                break;
              default:
                console.log("[Deepgram] Response received: ", response);
            }
          }
        } catch (error) {
          console.error("[Deepgram] Error processing message: ", error, "Message: ", message);
        }
      });

      // Event: Twilio WebSocket message
      connection.on("message", (message) => {
        try {
          const data = JSON.parse(message);

          switch (data.event) {
            case "media":
              latestMediaTimestamp = data.media.timestamp;
              if (deepgramWs && deepgramWs.readyState === WebSocket.OPEN) {
                deepgramWs.send(Buffer.from(data.media.payload, "base64"));
              }
              break;
            case "start":
              streamSid = data.start.streamSid;
              console.log("[Twilio] Stream started. SID:", streamSid);
              latestMediaTimestamp = 0;
              break;
            default:
            // console.log("[Twilio] Non-media event: ", data.event);
          }
        } catch (error) {
          console.error("[Twilio] Error parsing message: ", error, "Message: ", message);
        }
      });

      // Event: WebSocket connection close
      connection.on("close", () => {
        if (deepgramWs.readyState === WebSocket.OPEN) deepgramWs.close();
        console.log("[WS] Client disconnected");
      });
    });
  });
}
