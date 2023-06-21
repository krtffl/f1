import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import {
    FastifyBaseLogger,
    FastifyInstance,
    RawReplyDefaultExpression,
    RawRequestDefaultExpression,
    RawServerDefault,
} from 'fastify';

import { getDrivers } from './ergast-api/drivers';
import { getGrandPrix, getSeason } from './ergast-api/races';
import { getSeasons } from './ergast-api/seasons';
import { Session } from './live-api/config';
import { getDriverSessionRadios, getSessionRadios } from './live-api/radios';

const Year = Type.Number({ maximum: 9999, minimum: 1 });
const Race = Type.Number({ maximum: 24, minimum: 1 });
const Driver = Type.String({ minLength: 6, maxLength: 6 });

type FastifyTypebox = FastifyInstance<
    RawServerDefault,
    RawRequestDefaultExpression<RawServerDefault>,
    RawReplyDefaultExpression<RawServerDefault>,
    FastifyBaseLogger,
    TypeBoxTypeProvider
>;

export const router = async (fastify: FastifyTypebox): Promise<void> => {
    fastify.get(
        '/status',
        {
            schema: {
                description: 'health check',
                tags: ['health'],
                summary: 'anthem!',
            },
        },
        async (_, reply) => {
            return reply.sendFile('status.html');
        },
    );

    fastify.get(
        '/sessions',
        {
            schema: {
                description: 'grand prix sessions',
                tags: ['meta'],
                summary: 'list and compatible code for each grand prix session',
            },
        },
        async (_, reply) => {
            return reply.send(Object.keys(Session));
        },
    );

    fastify.get(
        '/seasons',
        {
            schema: {
                description: 'formula 1 seasons',
                tags: ['meta'],
                summary: 'list of available formula 1 seasons',
            },
        },
        async (_, reply) => {
            const seasons = await getSeasons();
            return reply.send(seasons);
        },
    );

    fastify.get(
        '/seasons/:year',
        {
            schema: {
                description: 'formula 1 season grand prixes',
                tags: ['meta'],
                summary: 'list of grand prixes in a season',
                params: Type.Object({ year: Year }),
            },
        },
        async (request, reply) => {
            const { year } = request.params;
            const season = await getSeason(year);
            return reply.send(season);
        },
    );

    fastify.get(
        '/seasons/:year/:race',
        {
            schema: {
                description: 'formula 1 gran prix',
                tags: ['meta'],
                summary: 'grand prix information including schedules for all sessions',
                params: Type.Object({ year: Year, race: Race }),
            },
        },
        async (request, reply) => {
            const { year, race } = request.params;
            const gp = await getGrandPrix(year, race);
            return reply.send(gp);
        },
    );

    fastify.get(
        '/seasons/:year/:race/:session',
        {
            schema: {
                description: 'team radios in a session',
                tags: ['radios'],
                summary: 'list of available team radios in a session',
                params: Type.Object({ year: Year, race: Race, session: Type.Enum(Session) }),
            },
        },
        async (request, reply) => {
            const { year, race, session } = request.params;
            const gp = await getGrandPrix(year, race);
            const radios = await getSessionRadios(gp, session);
            return reply.send(radios);
        },
    );

    fastify.get(
        '/seasons/:year/:race/:session/:driver',
        {
            schema: {
                description: 'driver team radios in a session',
                tags: ['radios'],
                summary: 'list of available team radios for a driver in a session',
                params: Type.Object({ year: Year, race: Race, session: Type.Enum(Session), driver: Driver }),
            },
        },
        async (request, reply) => {
            const { year, race, session, driver } = request.params;
            const gp = await getGrandPrix(year, race);
            const radios = await getDriverSessionRadios(driver, gp, session);
            return reply.send(radios);
        },
    );

    fastify.get(
        '/seasons/:year/drivers',
        {
            schema: {
                description: 'drivers in a seasion',
                tags: ['meta'],
                summary: 'list of available drivers in a season',
                params: Type.Object({ year: Year }),
            },
        },
        async (request, reply) => {
            const { year } = request.params;
            const drivers = await getDrivers(year);
            return reply.send(drivers);
        },
    );
};
