export default function twilioRoute(fastify) {
  // Route for Twilio to handle incoming calls
  fastify.all("/incoming", async (request, reply) => {
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
                            <Response>
                                <Connect>
                                    <Stream url="wss://${request.headers.host}/media-stream" />
                                </Connect>
                            </Response>`;

    reply.type("text/xml").send(twimlResponse);
  });
}
