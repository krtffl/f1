import fastifyStatic from '@fastify/static';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import fastify from 'fastify';
import path from 'path';

import { router } from './routes';

export const server = fastify({ logger: true }).withTypeProvider<TypeBoxTypeProvider>();

server.register(fastifyStatic, {
    root: path.join(__dirname, '..', 'public'),
});

server.register(fastifySwagger, {
    swagger: {
        info: {
            title: 'f1 team radios',
            description: 'get your fav driver team radio for any race you want',
            version: '1.0.0',
        },
        host: 'localhost:8080',
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json'],
        tags: [
            { name: 'health', description: 'to check api health' },
            { name: 'meta', description: 'to get config params' },
            { name: 'radios', description: 'to get radios urls' },
        ],
    },
});

server.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
        docExpansion: 'full',
        deepLinking: false,
    },
    uiHooks: {
        onRequest: function (_, _2, next) {
            next();
        },
        preHandler: function (_, _2, next) {
            next();
        },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject) => {
        return swaggerObject;
    },
    transformSpecificationClone: true,
});

server.register(router);

const start = async () => {
    try {
        await server.ready();
        server.swagger();
        await server.listen({ port: 8080 });
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

start();
