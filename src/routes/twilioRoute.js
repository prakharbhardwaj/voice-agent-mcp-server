export default function twilioRoute(fastify) {
  // Route for Twilio to handle the connection request
  fastify.all("/connect", async (request, reply) => {
    const assistantPrompt = request.query.assistantPrompt || "You are an AI assistant. How can I help you today?";
    const encodedPrompt = encodeURIComponent(assistantPrompt);

    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
                            <Response>
                                <Connect>
                                    <Stream url="wss://${request.headers.host}/media-stream">
                                        <Parameter name="assistantPrompt" value="${encodedPrompt}" />
                                    </Stream>
                                </Connect>
                            </Response>`;

    reply.type("text/xml").send(twimlResponse);
  });
}
