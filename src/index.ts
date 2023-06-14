import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { parseInt } from 'lodash';
import { Session } from './livetiming/config';
import { getSeasons } from './ergast-api/seasons';
import { getGrandPrix, getSeason } from './ergast-api/races';
import { getSessionRadios } from './livetiming/radios';
import { getDrivers } from './ergast-api/drivers';

const server = fastify({ logger: true });

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

server.get<{ Params: { season: string } }>('/seasons/:season', async (request, reply) => {
    const { season: year } = request.params;
    const season = await getSeason(year);
    return reply.send(season);
});

server.get<{ Params: { season: string; race: string } }>('/seasons/:season/:race', async (request, reply) => {
    const { season: year, race: round } = request.params;
    const race = await getGrandPrix((year), (round));
    return reply.send(race);
});

server.get<{ Params: { season: string; race: string; session: Session } }>(
    '/seasons/:season/:race/:session',
    async (request, reply) => {
        const { season: year, race: round, session } = request.params;
        const race = await getGrandPrix((year), (round));
        const radios = await getSessionRadios(race, session);
        return reply.send(radios);
    },
);

server.get<{ Params: { season: string } }>('/seasons/:season/drivers', async (request, reply) => {
    const { season } = request.params;
    const drivers = await getDrivers((season));
    return reply.send(drivers);
});

server.listen({ port: 8080 }, (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
});
