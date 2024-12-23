import { getWeatherFromCityName } from "./functionCall.js";

export async function handleFunctionCall(response, deepgramWs) {
  try {
    if (response.function_name === "getWeatherFromCityName") {
      const weatherInfo = await getWeatherFromCityName(response.input.city);

      const functionCallResponse = {
        type: "FunctionCallResponse",
        function_call_id: response.function_call_id,
        output: weatherInfo
      };

      console.log("Sending FunctionCallResponse:", functionCallResponse);

      deepgramWs.send(JSON.stringify(functionCallResponse));
    }
  } catch (error) {
    console.error("Error handling function call:", error);
  }
}
