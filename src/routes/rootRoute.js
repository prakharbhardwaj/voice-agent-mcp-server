export default function rootRoute(fastify) {
  // Root Route
  fastify.get("/", async (request, reply) => {
    reply.send({ message: "Twilio Media Stream Server is running!" });
  });
}
