import axios from 'axios';
import _ from 'lodash';

import { BASE_URL, DriversResponse } from './config';

export type Driver = {
    number?: string;
    code?: string;
    name: string;
    nationality: string;
};

export const getDrivers = async (year: string): Promise<Driver[]> => {
    try {
        console.log(`fetching drivers from ${year}`);
        const { data } = await axios.get<DriversResponse>(`${BASE_URL}/${year}/drivers.json`);
        return parseResponse(data);
    } catch (e) {
        console.error(`error getting drivers from ${year}. ${e}`);
        throw e;
    }
};

const parseResponse = (data: DriversResponse): Driver[] => {
    const drivers = data.MRData.DriverTable.Drivers ?? [];
    if (_.isEmpty(drivers)) {
        throw new Error(`could not find any driver information`);
    }
    return drivers.map((driver) => ({
        name: `${driver.givenName} ${driver.familyName}`,
        nationality: driver.nationality,
        number: driver.permanentNumber,
        code: `${driver.givenName.toUpperCase().slice(0, 3)}${driver.familyName.toUpperCase().slice(0, 3)}`,
    }));
};
