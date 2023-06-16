export const BASE_URL = 'https://ergast.com/api/f1';

export type RacesResponse = {
    MRData: {
        limit: string;
        url: string;
        offset: string;
        total: string;
        RaceTable: {
            season: string;
            Races: GrandPrix[];
        };
    };
};

export type SeasonsResponse = {
    MRData: {
        limit: string;
        url: string;
        offset: string;
        total: string;
        SeasonTable: {
            Seasons: Season[];
        };
    };
};

export type DriversResponse = {
    MRData: {
        limit: string;
        offset: string;
        total: string;
        url: string;
        DriverTable: {
            Drivers: Driver[];
        };
    };
};

type GrandPrix = {
    round: string;
    season: string;
    date: string;
    time: string;
    url: string;
    raceName: string;
    Circuit: Circuit;
    FirstPractice?: Session;
    SecondPractice?: Session;
    ThirdPractice?: Session;
    Qualifying?: Session;
    Sprint?: Session;
};

type Session = {
    date: string;
    time?: string;
};

type Circuit = {
    circuitId: string;
    url: string;
    circuitName: string;
    Location: {
        lat: string;
        long: string;
        locality: string;
        country: string;
    };
};

type Season = {
    season: string;
    url: string;
};

type Driver = {
    driverId: string;
    url: string;
    givenName: string;
    familyName: string;
    dateOfBirth: string;
    nationality: string;
    permanentNumber?: string;
    code?: string;
};
