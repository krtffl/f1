import _, { parseInt } from 'lodash';
import axios from 'axios';

export const ERGAST_API = 'https://ergast.com/api/f1';

type ErgastRacesResponse = {
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

const parseRacesResponse = (data: ErgastRacesResponse): ErgastGrandPrix[] => {
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
            const { data } = await axios.get<ErgastRacesResponse>(`${ERGAST_API}/${year}/${round}.json`);
            const races = parseRacesResponse(data);
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

type ErgastSeasonsResponse = {
    MRData: {
        SeasonTable: {
            Seasons: ErgastSeason[];
        };
        total: string;
    };
};

type ErgastSeason = {
    season: string;
};

const parseSeasonsResponse = (data: ErgastSeasonsResponse): number[] => {
    const seasons = data.MRData.SeasonTable.Seasons ?? [];
    if (_.isEmpty(seasons)) {
        throw new Error(`could not find any seasons information`);
    }
    const years: number[] = [];
    seasons.forEach((season) => years.push(parseInt(season.season)));
    return years;
};

export const getSeasons = async (): Promise<number[]> => {
    try {
        console.log(`fetching available seasons`);
        const { data } = await axios.get<ErgastSeasonsResponse>(`${ERGAST_API}/seasons.json?limit=100`);
        return parseSeasonsResponse(data);
    } catch (e) {
        console.error(`error getting seasons. ${e}`);
        throw e;
    }
};

export const getSeason = async (year: number): Promise<ErgastGrandPrix[]> => {
    try {
        console.log(`fetching races from ${year}`);
        const { data } = await axios.get<ErgastRacesResponse>(`${ERGAST_API}/${year}.json`);
        return parseRacesResponse(data);
    } catch (e) {
        console.error(`error getting races from ${year}. ${e}`);
        throw e;
    }
};

type ErgastDriversResponse = {
    MRData: {
        DriverTable: {
            Drivers: ErgastDriver[];
        };
    };
};

type ErgastDriver = {
    givenName: string;
    familyName: string;
    nationality: string;
    permanentNumber?: string;
    code: string;
};

const parseDriversResponse = (data: ErgastDriversResponse): ErgastDriver[] => {
    const drivers = data.MRData.DriverTable.Drivers ?? [];
    if (_.isEmpty(drivers)) {
        throw new Error(`could not find any driver information`);
    }
    return drivers.map((driver) => ({
        givenName: driver.givenName,
        familyName: driver.familyName,
        nationality: driver.nationality,
        permanentNumber: driver.permanentNumber,
        code: driver.code,
    }));
};

export const getDrivers = async (year: number): Promise<ErgastDriver[]> => {
    try {
        console.log(`fetching drivers from ${year}`);
        const { data } = await axios.get<ErgastDriversResponse>(`${ERGAST_API}/${year}/drivers.json`);
        return parseDriversResponse(data);
    } catch (e) {
        console.error(`error getting drivers from ${year}. ${e}`);
        throw e;
    }
};
