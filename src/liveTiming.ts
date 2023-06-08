import axios from 'axios';
import dayjs from 'dayjs';

import { ErgastRace } from './ergast';

export const LIVETIMING_API = 'https://livetiming.formula1.com/static';

const TEAM_RADIO = new RegExp(/TeamRadio\/[A-Z]{6}[0-9]{2}_[0-9]{1,2}_[0-9]{8}_[0-9]{6}.mp3/gm);

export enum Session {
    Race = 'Race',
    Quali = 'Qualifying',
    FP1 = 'Practice_1',
    FP2 = 'Practice_2',
    FP3 = 'Practice_3',
}

type TeamRadio = {
    path: string;
    // driverNumber: number;
    //timestamp: Date;
};

const parseRequest = (race: ErgastRace, session: Session): string => {
    try {
        const date = dayjs(race.date).format('YYYY-MM-DD');
        return LIVETIMING_API.concat(
            '/',
            race.date.getFullYear().toString(),
            '/',
            date,
            '_',
            race.raceName.split(' ').join('_'),
            '/',
            date,
            '_',
            session,
            '/',
            'TeamRadio.jsonStream',
        );
    } catch (e) {
        throw new Error(`could not parse team radios for ${race.raceName} ${session} from ${race.date}. ${e}`);
    }
};

const parseResponse = (data: string): TeamRadio[] => {
    const radios = data.match(TEAM_RADIO);
    if (!radios) {
        throw new Error(`could not find team radios`);
    }
    //TODO map driver number and timestamp
    return radios.map((r) => ({
        path: r,
    }));
};

export const getTeamRadios = async (race: ErgastRace, session: Session): Promise<TeamRadio[]> => {
    try {
        const url = parseRequest(race, session);
        console.log('URL', url);
        const { data } = await axios.get<string>(url);
        return parseResponse(data);
    } catch (e) {
        console.error(`error getting ${session} team radios for ${JSON.stringify(race)}. ${e}`);
        throw e;
    }
};
