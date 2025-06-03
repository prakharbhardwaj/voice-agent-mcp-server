import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from "@modelcontextprotocol/sdk/types.js";

import twilioService from "../services/twilioService.js";
import { logger } from "./logger.js";
import { mcpTools } from "./tools.js";
import { generateToolPrompt } from "./prompts.js";

class TwilioDeepgramMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "twilio-deepgram-voice-assistant",
        version: "1.0.0",
        description: "Twilio Deepgram MCP Server for HR voice calls"
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
    logger.info("Twilio Deepgram MCP Server initialized");
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: mcpTools
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "conduct_interview":
            return await this.conductInterview(args);

          case "notify_interview_result":
            return await this.notifyInterviewResult(args);

          case "discuss_job_opening":
            return await this.discussJobOpening(args);

          case "get_call_status":
            return await this.getCallStatus();

          case "check_twilio_config":
            return await this.checkTwilioConfig();

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        throw new McpError(ErrorCode.InternalError, `Error executing tool ${name}: ${error.message}`);
      }
    });
  }

  async conductInterview(args) {
    const { candidatePhone } = args;

    try {
      // Greeting message for the candidate

      // Generate dynamic prompt for the voice assistant
      const assistantPrompt = generateToolPrompt("conduct_interview", args);

      // Make the actual call using Twilio service
      const callResult = await twilioService.makeCall(candidatePhone, assistantPrompt);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                status: "interview_initiated",
                timestamp: new Date().toISOString(),
                ...callResult
              },
              null,
              2
            )
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to initiate interview: ${error.message}`);
    }
  }

  async notifyInterviewResult(args) {
    const { candidatePhone } = args;

    try {
      // Generate dynamic prompt for the voice assistant
      const assistantPrompt = generateToolPrompt("notify_interview_result", args);
      logger.info(`Preparing to notify interview result for ${candidatePhone} with prompt: ${assistantPrompt}`);

      // Make the actual call using Twilio service
      const callResult = await twilioService.makeCall(candidatePhone, assistantPrompt);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                status: "interview_result_notified",
                timestamp: new Date().toISOString(),
                ...callResult
              },
              null,
              2
            )
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to send interview result: ${error.message}`);
    }
  }

  async discussJobOpening(args) {
    const { candidatePhone, candidateName, position, companyInfo, nextSteps } = args;

    try {
      // Generate dynamic prompt for the voice assistant
      const assistantPrompt = generateToolPrompt("discuss_job_opening", args);

      // Make the actual call using Twilio service
      const callResult = await twilioService.makeCall(candidatePhone, assistantPrompt);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                status: "job_discussion_initiated",
                timestamp: new Date().toISOString(),
                ...callResult
              },
              null,
              2
            )
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to initiate job discussion: ${error.message}`);
    }
  }

  async getCallStatus() {
    // Generate dynamic prompt for the voice assistant
    const assistantPrompt = generateToolPrompt("get_call_status");

    // This would check the status of active HR calls
    const callStatus = twilioService.getCallStatus();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "call_status_report",
              assistantPrompt: assistantPrompt,
              ...callStatus
            },
            null,
            2
          )
        }
      ]
    };
  }

  async checkTwilioConfig() {
    // Generate dynamic prompt for the voice assistant
    const assistantPrompt = generateToolPrompt("check_twilio_config");

    const config = twilioService.getConfiguration();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "twilio_configuration_check",
              configured: config.configured,
              accountSid: config.accountSid,
              phoneNumber: config.phoneNumber,
              hasAuthToken: config.hasAuthToken,
              ready: twilioService.isReady(),
              timestamp: new Date().toISOString(),
              note: config.configured
                ? "Twilio is properly configured and ready to make calls"
                : "Twilio credentials not found. Calls will be simulated. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in your .env file.",
              assistantPrompt: assistantPrompt
            },
            null,
            2
          )
        }
      ]
    };
  }

  async getVoicePrompt(args) {
    const { toolName, context = {} } = args;

    try {
      const prompt = generateToolPrompt(toolName, context);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                toolName: toolName,
                context: context,
                assistantPrompt: prompt,
                timestamp: new Date().toISOString(),
                usage: "Use this prompt to provide context to your AI voice assistant for the specified tool"
              },
              null,
              2
            )
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to generate voice prompt: ${error.message}`);
    }
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      logger.error("[MCP Error]", error);
    };

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.error("Twilio Deepgram MCP Server running on stdio");
  }
}

export default TwilioDeepgramMCPServer;
