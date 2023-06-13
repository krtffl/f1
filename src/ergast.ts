import _ from 'lodash';
import axios from 'axios';

export const ERGAST_API = 'https://ergast.com/api/f1';

type ErgastResponse = {
    MRData: {
        RaceTable: {
            Races: ErgastGrandPrix[];
        };
    };
};

export type ErgastGrandPrix = {
    round: string;
    season: string;
    date: string;
    raceName: string;
    FirstPractice: ErgastSession;
    SecondPractice: ErgastSession;
    ThirdPractice?: ErgastSession;
    Qualifying: ErgastSession;
    Sprint?: ErgastSession;
};

type ErgastSession = {
    date: string;
    time: string;
};

const parseResponse = (data: ErgastResponse): ErgastGrandPrix[] => {
    const races = data.MRData.RaceTable.Races ?? [];
    if (_.isEmpty(races)) {
        throw new Error(`could not find any race information`);
    }
    return races.map((race) => ({
        round: race.round,
        season: race.season,
        raceName: race.raceName,
        date: race.date,
        FirstPractice: race.FirstPractice,
        SecondPractice: race.SecondPractice,
        ThirdPractice: race.ThirdPractice,
        Qualifying: race.Qualifying,
        Sprint: race.Sprint,
    }));
};

export const getGrandPrix = async (year: number, round: number | string): Promise<ErgastGrandPrix> => {
    try {
        console.log(`fetching race ${round} from ${year}`);
        if (typeof round === 'number') {
            const { data } = await axios.get<ErgastResponse>(`${ERGAST_API}/${year}/${round}.json`);
            const races = parseResponse(data);
            if (!races || !races[0]) {
                throw new Error(`could not get race ${round} from ${year}`);
            }
            return races[0];
        }
        const season = await getSeason(year);
        const race = season.find((race) => race.raceName.includes(round)); // TODO add fuzzy match
        if (!race) {
            throw new Error(`could not get race ${round} from ${year}`);
        }
        return race;
    } catch (e) {
        console.error(`error getting race ${round} from ${year}. ${e}`);
        throw e;
    }
};

export const getSeason = async (year: number): Promise<ErgastGrandPrix[]> => {
    try {
        console.log(`fetching races from ${year}`);
        const { data } = await axios.get<ErgastResponse>(`${ERGAST_API}/${year}.json`);
        return parseResponse(data);
    } catch (e) {
        console.error(`error getting races from ${year}. ${e}`);
        throw e;
    }
};
