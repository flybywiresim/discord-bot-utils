/* eslint-disable camelcase */

import { TypeGuard, isArray, isBoolean, isNull, isNumber, isString, isTrueObject } from '../typeGuard';

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
    if (isNull(events) || !isTrueObject(events)) {
        return false;
    }

    if (!('data' in events)) {
        return false;
    }

    if (!isArray(events.data)) {
        return false;
    }

    if (!events.data.every(isData)) {
        return false;
    }

    return true;
};

const isData: TypeGuard<Data> = (data): data is Data => {
    if (isNull(data) || !isTrueObject(data)) {
        return false;
    }

    if (!('organisers' in data) || !('airports' in data) || !('routes' in data)) {
        return false;
    }

    if (!isArray(data.organisers) || !isArray(data.airports) || !isArray(data.routes)) {
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
        ('id' in data && isNumber(data.id))
        && ('type' in data && (data.type === 'Event' || data.type === 'Controller Examination' || data.type === 'VASOPS Event'))
        && ('name' in data && isString(data.name))
        && ('link' in data && isString(data.link))
        && ('start_time' in data && isString(data.start_time))
        && ('end_time' in data && isString(data.end_time))
        && ('short_description' in data && isString(data.short_description))
        && ('description' in data && isString(data.description))
        && ('banner' in data && isString(data.banner))
    );
};

const isOrganiser: TypeGuard<Organiser> = (organiser): organiser is Organiser => {
    if (isNull(organiser) || !isTrueObject(organiser)) {
        return false;
    }

    return (
        ('region' in organiser && (isString(organiser.region) || isNull(organiser.region)))
        && ('division' in organiser && (isString(organiser.division) || isNull(organiser.division)))
        && ('subdivision' in organiser && (isString(organiser.subdivision) || isNull(organiser.subdivision)))
        && ('organised_by_vatsim' in organiser && isBoolean(organiser.organised_by_vatsim))
    );
};

const isAirport: TypeGuard<Airport> = (airport): airport is Airport => {
    if (isNull(airport) || !isTrueObject(airport)) {
        return false;
    }

    return ('icao' in airport && isString(airport.icao));
};

const isRoute: TypeGuard<Route> = (route): route is Route => {
    if (isNull(route) || !isTrueObject(route)) {
        return false;
    }

    return (
        ('departure' in route && isString(route.departure))
        && ('arrival' in route && isString(route.arrival))
        && ('route' in route && isString(route.route))
    );
};
