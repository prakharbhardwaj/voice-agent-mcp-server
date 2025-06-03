export const SettingsConfiguration = {
  type: "Settings",
  audio: {
    input: {
      encoding: "mulaw",
      sample_rate: 8000
    },
    output: {
      encoding: "mulaw",
      sample_rate: 8000,
      container: "none"
    }
  },
  agent: {
    language: "en",
    listen: {
      provider: { type: "deepgram", model: "nova-3" }
    },
    think: {
      provider: {
        type: "open_ai", // https://developers.deepgram.com/docs/voice-agent-llm-models#supported-llm-providers-and-models
        model: "gpt-4o-mini"
      },
      prompt: "[DYNAMIC_PROMPT]",
      functions: [
        {
          name: "end_call",
          description: "Ends the call with the user",
          parameters: {
            type: "object",
            properties: {
              reason: {
                type: "string",
                description: "The reason for ending the call"
              }
            },
            required: ["reason"]
          }
        }
      ]
    },
    speak: {
      provider: { type: "deepgram", model: "aura-2-asteria-en" }
    }
  }
};
