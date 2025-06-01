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
      prompt: "You are a helpful assistant that can provide weather information. Please provide the weather information for a city.",
      functions: [
        {
          name: "getWeatherFromCityName",
          description: "Get the weather from the given city name",
          parameters: {
            type: "object",
            properties: {
              city: {
                type: "string",
                description: "The city name to get the weather from"
              }
            },
            required: ["city"]
          }
        }
      ]
    },
    speak: {
      provider: { type: "deepgram", model: "aura-2-asteria-en" }
    }
  }
};
