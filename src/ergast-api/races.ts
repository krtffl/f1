import axios from 'axios';
import _ from 'lodash';

import { BASE_URL, RacesResponse } from './config';

export type GrandPrix = {
    round: string;
    season: string;
    name: string;
    circuit: string;
    country: string;
    locality: string;
    race: Session;
    qualifying?: Session;
    freePractice1?: Session;
    freePractice2?: Session;
    freePractice3?: Session;
    sprint?: Session;
    shootout?: Session;
};

type Session = {
    date: string;
    time?: string;
};

export const getGrandPrix = async (year: number, round: number): Promise<GrandPrix> => {
    try {
        console.log(`fetching race ${round} from ${year}`);
        const { data } = await axios.get<RacesResponse>(`${BASE_URL}/${year}/${round}.json`);
        const races = parseResponse(data);
        if (!races || !races[0]) {
            throw new Error(`could not get race ${round} from ${year}`);
        }
        return races[0];
    } catch (e) {
        console.error(`error getting race ${round} from ${year}. ${e}`);
        throw e;
    }
};

export const getSeason = async (year: number): Promise<GrandPrix[]> => {
    try {
        console.log(`fetching races from ${year}`);
        const { data } = await axios.get<RacesResponse>(`${BASE_URL}/${year}.json`);
        return parseResponse(data);
    } catch (e) {
        console.error(`error getting races from ${year}. ${e}`);
        throw e;
    }
};

const parseResponse = (data: RacesResponse): GrandPrix[] => {
    const races = data.MRData.RaceTable.Races ?? [];
    if (_.isEmpty(races)) {
        throw new Error(`could not find any race information`);
    }
    return races.map((race) => ({
        round: race.round,
        season: race.season,
        name: race.raceName,
        circuit: race.Circuit.circuitName,
        country: race.Circuit.Location.country,
        locality: race.Circuit.Location.locality,
        race: { date: race.date, time: race.time },
        qualifying: race.Qualifying,
        freePractice1: race.FirstPractice,
        freePractice2: race.SecondPractice,
        freePractice3: race.ThirdPractice,
        sprint: race.Sprint,
    }));
};
