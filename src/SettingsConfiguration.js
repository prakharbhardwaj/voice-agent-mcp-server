export const SettingsConfiguration = {
  type: "SettingsConfiguration",
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
    listen: {
      model: "nova-2"
    },
    think: {
      provider: {
        type: "open_ai" // https://developers.deepgram.com/docs/voice-agent-llm-models#supported-llm-providers-and-models
      },
      model: "gpt-4o-mini",
      instructions: "You are a helpful assistant that can provide weather information. Please provide the weather information for a city.",
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
      model: "aura-asteria-en"
    }
  }
};
