import dayjs, { Dayjs } from 'dayjs';

import { GrandPrix } from '../ergast-api/races';

export const BASE_URL = 'https://livetiming.formula1.com/static';

export const TEAM_RADIO = new RegExp(/TeamRadio\/[A-Z]{6}[0-9]{2}_[0-9]{1,2}_[0-9]{8}_[0-9]{6}.mp3/gm);

export enum Session {
    Race = 'Race',
    Quali = 'Qualifying',
    Sprint = 'Sprint',
    Shootout = 'Sprint_Shootout',
    FP1 = 'Practice_1',
    FP2 = 'Practice_2',
    FP3 = 'Practice_3',
}

export const getSessionRadiosSource = (gp: GrandPrix, session: Session): URL | undefined => {
    const sessionDate = getSessionDate(gp, session);
    const raceDate = getSessionDate(gp, Session.Race);
    if (!sessionDate || !raceDate) return undefined;
    return new URL(
        BASE_URL.concat(
            '/',
            raceDate.year().toString(),
            '/',
            raceDate.format('YYYY-MM-DD'),
            '_',
            gp.name.split(' ').join('_'),
            '/',
            sessionDate.format('YYYY-MM-DD'),
            '_',
            session,
            '/',
            'TeamRadio.jsonStream',
        ),
    );
};

const getSessionDate = (gp: GrandPrix, session: Session): Dayjs | undefined => {
    let date;
    switch (session) {
        case Session.Race:
            date = dayjs(gp.race.date);
            break;
        case Session.Quali:
            date = dayjs(gp.qualifying?.date);
            break;
        case Session.Sprint:
            date = dayjs(gp.sprint?.date);
            break;
        case Session.FP1:
            date = dayjs(gp.freePractice1?.date);
            break;
        case Session.FP2:
            date = dayjs(gp.freePractice2?.date);
            break;
        case Session.FP3:
            date = dayjs(gp.freePractice3?.date);
            break;
    }
    return date;
};
