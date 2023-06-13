import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';

const server = fastify({ logger: true });

server.register(fastifyStatic, {
    root: path.join(__dirname, '..', 'public'),
});

server.get('/status', async (_, reply) => {
    return reply.sendFile('status.html');
});

server.listen({ port: 8080 }, (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
});
