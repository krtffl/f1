import axios from 'axios';
import _ from 'lodash';

import { Driver } from '../ergast-api/drivers';
import { GrandPrix } from '../ergast-api/races';
import { getSessionRadiosSource, Session, TEAM_RADIO } from './config';

type Radio = {
    url: string;
    driverNumber?: string;
    driver?: string;
    timestamp?: string;
};

export const getSessionRadios = async (gp: GrandPrix, session: Session): Promise<Radio[]> => {
    console.log(`fetching radios from ${session} ${gp.name}`);
    const url = getSessionRadiosSource(gp, session)?.href;
    if (!url) {
        throw new Error(`could not find ${gp.name} ${session}`);
    }
    try {
        const { data } = await axios.get<string>(url);
        return parseResponse(data, url);
    } catch (e) {
        console.error(`error getting team radios for ${gp.name}'s ${session}`);
        throw e;
    }
};

export const getDriverSessionRadios = async (
    driver: Driver['code'],
    gp: GrandPrix,
    session: Session,
): Promise<Radio[]> => {
    const radios = await getSessionRadios(gp, session);
    const driverRadios = radios.filter((r) => r.driver === driver);
    if (_.isEmpty(driverRadios)) {
        throw new Error(`could not find $${driver}'s ${gp.name} ${session} team radios`);
    }
    return driverRadios;
};

const parseResponse = (data: string, url: string): Radio[] => {
    const radios = data.match(TEAM_RADIO);
    if (_.isEmpty(radios) || _.isNil(radios)) {
        throw new Error(`could not find team radios`);
    }
    return radios.map((r) => ({
        url: url.replace('TeamRadio.jsonStream', r),
        driver: r.split('/')[1]?.split('_')[0]?.slice(0, 6),
        driverNumber: r.split('_')[1],
        timestamp: r.split('_')[3]?.split('.')[0]?.match(/.{2}/g)?.join(':'),
    }));
};
