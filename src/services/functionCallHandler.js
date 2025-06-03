export async function handleFunctionCall(functions, connection, deepgramWs) {
  try {
    console.log("[Deepgram] Function call request received:", functions);
    const funct = functions?.[0];
    const functArguments = JSON.parse(funct?.arguments);

    if (funct.name === "end_call") {
      const functionCallResponse = {
        type: "FunctionCallResponse",
        id: funct.id,
        name: "end_call",
        content: functArguments.reason || "Ending the call as requested."
      };

      console.log("Sending FunctionCallResponse:", functionCallResponse);
      deepgramWs.send(JSON.stringify(functionCallResponse));

      // Send a message to the client to end the call
      connection.close(); // Close the WebSocket connection
      deepgramWs.close(); // Close the Deepgram WebSocket connection
    }
  } catch (error) {
    console.error("Error handling function call:", error);
  }
}
