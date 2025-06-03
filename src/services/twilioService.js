import twilio from "twilio";
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } from "../config/dotenv.js";
import { logger } from "../mcp/logger.js";

class TwilioService {
  constructor() {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      logger.debug("Twilio credentials not configured. Calls will be simulated.");
      this.client = null;
      this.isConfigured = false;
    } else {
      this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      this.isConfigured = true;
    }
  }

  async makeCall(toNumber, assistantPrompt) {
    if (!this.isConfigured) {
      throw new Error("Twilio is not configured. Please set up your credentials.");
    }

    try {
      logger.info(`[TWILIO] Attempting to call ${toNumber}...`);

      const call = await this.client.calls.create({
        to: toNumber,
        from: TWILIO_PHONE_NUMBER,
        url: `https://${process.env.SERVER_URL}/connect?assistantPrompt=${encodeURIComponent(assistantPrompt)}`
      });

      logger.info(`[TWILIO] Call initiated successfully. SID: ${call.sid}`);

      return {
        success: true,
        sid: call.sid,
        to: toNumber,
        assistantPrompt: assistantPrompt,
        status: call.status,
        dateCreated: call.dateCreated
      };
    } catch (error) {
      logger.error(`[TWILIO] Error making call to ${toNumber}:`, error.message);
      logger.error(`[TWILIO] Error details:`, error);

      return {
        success: false,
        error: error.message,
        to: toNumber,
        assistantPrompt: assistantPrompt
      };
    }
  }

  async getCallStatus(callSid) {
    if (!this.isConfigured) {
      return {
        error: "Twilio is not configured. Please set up your credentials.",
        sid: callSid
      };
    }

    try {
      const call = await this.client.calls(callSid).fetch();
      return {
        sid: call.sid,
        status: call.status,
        duration: call.duration,
        startTime: call.startTime,
        endTime: call.endTime,
        price: call.price,
        direction: call.direction
      };
    } catch (error) {
      logger.error(`[TWILIO] Error fetching call status for ${callSid}:`, error.message);
      return {
        error: error.message,
        sid: callSid
      };
    }
  }

  isReady() {
    return this.isConfigured;
  }

  getConfiguration() {
    return {
      configured: this.isConfigured,
      accountSid: this.isConfigured ? TWILIO_ACCOUNT_SID : "Not configured",
      phoneNumber: this.isConfigured ? TWILIO_PHONE_NUMBER : "Not configured",
      hasAuthToken: !!TWILIO_AUTH_TOKEN
    };
  }
}

// Export singleton instance
export default new TwilioService();
