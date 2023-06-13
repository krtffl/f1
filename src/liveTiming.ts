import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import { ErgastGrandPrix } from './ergast';

export const LIVETIMING_API = 'https://livetiming.formula1.com/static';

const TEAM_RADIO = new RegExp(/TeamRadio\/[A-Z]{6}[0-9]{2}_[0-9]{1,2}_[0-9]{8}_[0-9]{6}.mp3/gm);

export enum Session {
    Race = 'Race',
    Quali = 'Qualifying',
    Sprint = 'Sprint',
    Shootout = 'Sprint_Shootout',
    FP1 = 'Practice_1',
    FP2 = 'Practice_2',
    FP3 = 'Practice_3',
}

type TeamRadio = {
    path: string;
    driverNumber?: string;
    driver?: string;
    timestamp?: string;
};

const parseResponse = (data: string, url: string): TeamRadio[] => {
    const radios = data.match(TEAM_RADIO);
    if (!radios) {
        throw new Error(`could not find team radios`);
    }
    return radios.map((r) => ({
        path: url.replace('TeamRadio.jsonStream', r),
        driver: r.split('/')[1]?.split('_')[0]?.slice(0, 6),
        driverNumber: r.split('_')[1],
        timestamp: r.split('_')[3]?.split('.')[0],
    }));
};

export const getSessionRadios = async (race: ErgastGrandPrix, session: Session): Promise<TeamRadio[]> => {
    console.log(`fetching radios from ${session} ${race.raceName}`);
    const url = getSessionRadiosURL(race, session)?.href;
    if (!url) {
        throw new Error(`could not find ${race.raceName} ${session}`);
    }
    try {
        const { data } = await axios.get<string>(url);
        return parseResponse(data, url);
    } catch (e) {
        console.error(`error getting team radios for ${race.raceName}'s ${session}`);
        throw e;
    }
};

export const getDriverSessionRadios = async (
    driver: string,
    race: ErgastGrandPrix,
    session: Session,
): Promise<TeamRadio[]> => {
    const radios = await getSessionRadios(race, session);
    return radios.filter((r) => r.driver === driver);
};

const getSessionDate = (race: ErgastGrandPrix, session: Session): Dayjs | undefined => {
    let date;
    switch (session) {
        case Session.Race:
            date = dayjs(race.date);
            break;
        case Session.Quali:
            date = dayjs(race.Qualifying.date);
            break;
        case Session.Sprint:
            date = dayjs(race.Sprint?.date);
            break;
        case Session.FP1:
            date = dayjs(race.FirstPractice.date);
            break;
        case Session.FP2:
            date = dayjs(race.SecondPractice.date);
            break;
        case Session.FP3:
            date = dayjs(race.ThirdPractice?.date);
            break;
    }
    return date;
};

const getSessionRadiosURL = (race: ErgastGrandPrix, session: Session): URL | undefined => {
    const sessionDate = getSessionDate(race, session);
    const raceDate = getSessionDate(race, Session.Race);
    if (!sessionDate || !raceDate) return undefined;
    return new URL(
        LIVETIMING_API.concat(
            '/',
            raceDate.year().toString(),
            '/',
            raceDate.format('YYYY-MM-DD'),
            '_',
            race.raceName.split(' ').join('_'),
            '/',
            sessionDate.format('YYYY-MM-DD'),
            '_',
            session,
            '/',
            'TeamRadio.jsonStream',
        ),
    );
};
