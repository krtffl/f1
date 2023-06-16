import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { getSeasons } from './ergast-api/seasons';
import { getGrandPrix, getSeason } from './ergast-api/races';
import { getDrivers } from './ergast-api/drivers';
import { Type, TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Session } from './live-api/config';
import { getDriverSessionRadios, getSessionRadios } from './live-api/radios';

const server = fastify({ logger: true }).withTypeProvider<TypeBoxTypeProvider>();

const Year = Type.Number({ maximum: 9999, minimum: 1})
const Race = Type.Number({ maximum: 24, minimum: 1})
const Driver = Type.String({ minLength: 6, maxLength: 6 })

server.register(fastifyStatic, {
    root: path.join(__dirname, '..', 'public'),
});

server.get('/status', async (_, reply) => {
    return reply.sendFile('status.html');
});

server.get('/sessions', async (_, reply) => {
    return reply.send(Object.keys(Session));
});

server.get('/seasons', async (_, reply) => {
    const seasons = await getSeasons();
    return reply.send(seasons);
});

server.get('/seasons/:year',  { schema: { params: Type.Object({year: Year})}},  async (request, reply) => {
    const { year } = request.params;
    const season = await getSeason(year);
    return reply.send(season);
});

server.get('/seasons/:year/:race', { schema: { params: Type.Object({year: Year, race: Race})}}, async (request, reply) => {
    const { year, race } = request.params;
    const gp = await getGrandPrix(year, race);
    return reply.send(gp);
});

server.get(
    '/seasons/:year/:race/:session',
    { schema: { params: Type.Object({ year: Year, race: Race, session: Type.Enum(Session)})}},
    async (request, reply) => {
        const { year, race, session } = request.params;
        const gp = await getGrandPrix(year, race);
        const radios = await getSessionRadios(gp, session);
        return reply.send(radios);
    },
);

server.get(
    '/seasons/:year/:race/:session/:driver',
    { schema: { params: Type.Object({ year: Year, race: Race, session: Type.Enum(Session), driver: Driver})}},
    async (request, reply) => {
        const { year, race, session, driver } = request.params;
        const gp = await getGrandPrix(year, race);
        const radios = await getDriverSessionRadios(driver, gp, session);
        return reply.send(radios);
    },
);

server.get('/seasons/:year/drivers', {  schema: { params: Type.Object({year: Year})}}, async (request, reply) => {
    const { year } = request.params;
    const drivers = await getDrivers(year);
    return reply.send(drivers);
});

server.listen({ port: 8080 }, (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
});
