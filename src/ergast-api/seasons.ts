import axios from 'axios';
import _ from 'lodash';

import { BASE_URL, SeasonsResponse } from './config';

export const getSeasons = async (): Promise<string[]> => {
    try {
        console.log(`fetching available seasons`);
        const { data } = await axios.get<SeasonsResponse>(`${BASE_URL}/seasons.json?limit=100`); // setting it as 100 to avoid hitting it 2 times
        return parseResponse(data);
    } catch (e) {
        console.error(`error getting seasons. ${e}`);
        throw e;
    }
};

const parseResponse = (data: SeasonsResponse): string[] => {
    const seasons = data.MRData.SeasonTable.Seasons ?? [];
    if (_.isEmpty(seasons)) {
        throw new Error(`could not find any information on seasons`);
    }
    const years: string[] = [];
    seasons.forEach((season) => years.push(season.season));
    if (_.isEmpty(years)) {
        throw new Error(`could not parse seasons`);
    }
    return years;
};
