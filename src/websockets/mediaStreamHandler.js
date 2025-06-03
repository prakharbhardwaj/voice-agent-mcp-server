import WebSocket from "ws";
import { SettingsConfiguration } from "../SettingsConfiguration.js";
import { DEEPGRAM_API_KEY } from "../config/dotenv.js";
import { handleFunctionCall } from "../services/functionCallHandler.js";

export default function mediaStreamHandler(fastify) {
  fastify.register(async (fastify) => {
    fastify.get("/media-stream", { websocket: true }, (connection, req) => {
      console.log("[WS] Client connected");

      // Create a copy of SettingsConfiguration
      let currentSettings = JSON.parse(JSON.stringify(SettingsConfiguration));

      // State variables
      let streamSid = null;
      let deepgramWs = null;
      let latestMediaTimestamp = 0;

      // Event: Twilio WebSocket message
      connection.on("message", (message) => {
        try {
          const data = JSON.parse(message);

          switch (data.event) {
            case "start":
              streamSid = data.start.streamSid;
              console.log("[Twilio] Stream started. SID:", streamSid);
              console.log("[WS] Received start event with stream SID:", data);

              // Extract assistantPrompt from TwiML parameters
              const assistantPrompt = data.start.customParameters?.assistantPrompt;
              if (assistantPrompt) {
                const decodedPrompt = decodeURIComponent(assistantPrompt);
                currentSettings.agent.think.prompt = decodedPrompt;
                console.log("[WS] Using custom assistant prompt:", decodedPrompt);
              }

              // Initialize Deepgram WebSocket after getting the prompt
              initializeDeepgram();
              break;
            case "media":
              latestMediaTimestamp = data.media.timestamp;
              if (deepgramWs && deepgramWs.readyState === WebSocket.OPEN) {
                deepgramWs.send(Buffer.from(data.media.payload, "base64"));
              }
              break;
            case "stop":
              console.log("[Twilio] Stream stopped. SID:", streamSid);
              if (deepgramWs) {
                deepgramWs.close();
                deepgramWs = null;
              }
              break;
          }
        } catch (error) {
          console.error("[Twilio] Error parsing message: ", error, "Message: ", message);
        }
      });

      function initializeDeepgram() {
        // Initialize Deepgram WebSocket
        deepgramWs = new WebSocket("wss://agent.deepgram.com/v1/agent/converse", {
          headers: {
            Authorization: "Token " + DEEPGRAM_API_KEY
          }
        });

        // Event: Deepgram WebSocket open
        deepgramWs.on("open", () => {
          console.log("[Deepgram] Connected");
          // Send the customized settings configuration with the updated prompt
          deepgramWs.send(JSON.stringify(currentSettings));
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
                      content: "Hello, I'm Ginie, speaking from GoGroup HR department, how are you doing today?"
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
                  await handleFunctionCall(response.functions, connection, deepgramWs, streamSid);
                  break;
                default:
                  console.log("[Deepgram] Response received: ", response);
              }
            }
          } catch (error) {
            console.error("[Deepgram] Error processing message: ", error, "Message: ", message);
          }
        });
      }
    });
  });
}
