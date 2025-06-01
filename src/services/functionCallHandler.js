import { getWeatherFromCityName } from "./functionCall.js";

export async function handleFunctionCall(functions, deepgramWs) {
  try {
    const funct = functions?.[0];
    if (funct.name === "getWeatherFromCityName") {
      const functArguments = JSON.parse(funct?.arguments);

      const weatherInfo = await getWeatherFromCityName(functArguments.city);

      const functionCallResponse = {
        type: "FunctionCallResponse",
        id: funct.id,
        name: "getWeatherFromCityName",
        content: weatherInfo
      };

      console.log("Sending FunctionCallResponse:", functionCallResponse);

      deepgramWs.send(JSON.stringify(functionCallResponse));
    }
  } catch (error) {
    console.error("Error handling function call:", error);
  }
}
