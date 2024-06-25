/* eslint-disable camelcase */

import { TypeGuard } from '../typeGuard';

/**
 * @see https://vatsim.dev/api/events-api/1.0.0/list-events
 */
export interface VatsimEvents {
    data: Data[];
}

export interface Data {
    id: number;
    type: 'Event' | 'Controller Examination' | 'VASOPS Event';
    name: string;
    link: string;
    organisers: Organiser[];
    airports: Airport[];
    routes: Route[];
    start_time: string;
    end_time: string;
    short_description: string;
    description: string;
    banner: string;
}

export interface Organiser {
    region: string | null;
    division: string | null;
    subdivision: string | null;
    organised_by_vatsim: boolean
}

export interface Airport {
    icao: string;
}

export interface Route {
    departure: string;
    arrival: string;
    route: string;
}

export const isVatsimEvents: TypeGuard<VatsimEvents> = (events): events is VatsimEvents => {
    if (typeof events !== 'object' || events === null) {
        return false;
    }

    if (!('data' in events)) {
        return false;
    }

    if (!Array.isArray(events.data)) {
        return false;
    }

    if (!events.data.every(isData)) {
        return false;
    }

    return true;
};

const isData: TypeGuard<Data> = (data): data is Data => {
    if (typeof data !== 'object' || data === null) {
        return false;
    }

    if (!('organisers' in data) || !('airports' in data) || !('routes' in data)) {
        return false;
    }

    if (!Array.isArray(data.organisers) || !Array.isArray(data.airports) || !Array.isArray(data.routes)) {
        return false;
    }

    if (!data.organisers.every(isOrganiser)) {
        return false;
    }

    if (!data.airports.every(isAirport)) {
        return false;
    }

    if (!data.routes.every(isRoute)) {
        return false;
    }

    return (
        ('id' in data && typeof data.id === 'number')
        && ('type' in data && (data.type === 'Event' || data.type === 'Controller Examination' || data.type === 'VASOPS Event'))
        && ('name' in data && typeof data.name === 'string')
        && ('link' in data && typeof data.link === 'string')
        && ('start_time' in data && typeof data.start_time === 'string')
        && ('end_time' in data && typeof data.end_time === 'string')
        && ('short_description' in data && typeof data.short_description === 'string')
        && ('description' in data && typeof data.description === 'string')
        && ('banner' in data && typeof data.banner === 'string')
    );
};

const isOrganiser: TypeGuard<Organiser> = (organiser): organiser is Organiser => {
    if (typeof organiser !== 'object' || organiser === null) {
        return false;
    }

    return (
        ('region' in organiser && (typeof organiser.region === 'string' || organiser.region === null))
        && ('division' in organiser && (typeof organiser.division === 'string' || organiser.division === null))
        && ('subdivision' in organiser && (typeof organiser.subdivision === 'string' || organiser.subdivision === null))
        && ('organised_by_vatsim' in organiser && typeof organiser.organised_by_vatsim === 'boolean')
    );
};

const isAirport: TypeGuard<Airport> = (airport): airport is Airport => {
    if (typeof airport !== 'object' || airport === null) {
        return false;
    }

    return ('icao' in airport && typeof airport.icao === 'string');
};

const isRoute: TypeGuard<Route> = (route): route is Route => {
    if (typeof route !== 'object' || route === null) {
        return false;
    }

    return (
        ('departure' in route && typeof route.departure === 'string')
        && ('arrival' in route && typeof route.arrival === 'string')
        && ('route' in route && typeof route.route === 'string')
    );
};
