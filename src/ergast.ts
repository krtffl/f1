import _ from "lodash";
import axios from "axios";

export const ERGAST_API = 'https://ergast.com/api/f1'

type ErgastResponse = {
    MRData: {
        RaceTable: {
            Races: ErgastRace[] 
        }
    }
}

export type ErgastRace = {
    raceName: string;
    date: Date;
}

const parseResponse = (data: ErgastResponse): ErgastRace => {
    const races =  data.MRData.RaceTable.Races ?? []
    if (_.isEmpty(races) || _.isEmpty(races[0])) {
        throw new Error(`could not find any race information`)
    }
    if (races.length > 1) {
        throw new Error(`received information for more than one race`)
    }
    return { raceName: races[0].raceName, date: new Date(races[0].date) } 
}

//TODO allow searching by race or circuit name too
export const getRace = async (year: number, round: number) => {
   try {
        console.log(`fetching race ${round} from ${year}`)
        const { data } = await axios.get<ErgastResponse>(`${ERGAST_API}/${year}/${round}.json`);
        return parseResponse(data)
   } catch(e) {
        console.error(`error getting race ${round} from ${year}. ${e}`)
        throw e
   } 
}

