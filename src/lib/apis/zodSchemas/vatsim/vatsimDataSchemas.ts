import { z } from 'zod';

export const VatsimMilitaryRatingSchema = z.object({
    id: z.number(),
    short_name: z.string(),
    long_name: z.string(),
});

export const VatsimPilotRatingSchema = z.object({
    id: z.number(),
    short_name: z.string(),
    long_name: z.string(),
});

export const VatsimRatingSchema = z.object({
    id: z.number(),
    short: z.string(),
    long: z.string(),
});

export const VatsimFacilitySchema = z.object({
    id: z.number(),
    short: z.string(),
    long: z.string(),
});

export const VatsimFlightPlanSchema = z.object({
    flight_rules: z.enum(['I', 'V']),
    aircraft: z.string(),
    aircraft_faa: z.string(),
    aircraft_short: z.string(),
    departure: z.string(),
    arrival: z.string(),
    alternate: z.string(),
    deptime: z.string(),
    enroute_time: z.string(),
    fuel_time: z.string(),
    remarks: z.string(),
    route: z.string(),
    revision_id: z.number(),
    assigned_transponder: z.string(),
});

export const VatsimPrefileSchema = z.object({
    cid: z.number(),
    name: z.string(),
    callsign: z.string(),
    flight_plan: VatsimFlightPlanSchema,
    last_updated: z.string(),
});

export const VatsimServerSchema = z.object({
    ident: z.string(),
    hostname_or_ip: z.string(),
    location: z.string(),
    name: z.string(),
    /**
     * @deprecated
     */
    clients_connection_allowed: z.number(),
    client_connections_allowed: z.boolean(),
    is_sweatbox: z.boolean(),
});

export const VatsimAtisSchema = z.object({
    cid: z.number(),
    name: z.string(),
    callsign: z.string(),
    frequency: z.string(),
    facility: z.number(),
    rating: z.number(),
    server: z.string(),
    visual_range: z.number(),
    atis_code: z.nullable(z.string()),
    text_atis: z.nullable(z.array(z.string())),
    last_updated: z.string(),
    logon_time: z.string(),
});

export const VatsimControllerSchema = z.object({
    cid: z.number(),
    name: z.string(),
    callsign: z.string(),
    facility: z.number(),
    frequency: z.string(),
    rating: z.number(),
    server: z.string(),
    visual_range: z.number(),
    text_atis: z.nullable(z.array(z.string())),
    last_updated: z.string(),
    logon_time: z.string(),
});

export const VatsimPilotSchema = z.object({
    cid: z.number(),
    name: z.string(),
    callsign: z.string(),
    server: z.string(),
    pilot_rating: z.number(),
    military_rating: z.number(),
    latitude: z.number(),
    longitude: z.number(),
    altitude: z.number(),
    groundspeed: z.number(),
    transponder: z.string(),
    heading: z.number(),
    qnh_i_hg: z.number(),
    qnh_mb: z.number(),
    flight_plan: z.nullable(VatsimFlightPlanSchema),
    logon_time: z.string(),
    last_updated: z.string(),
});

export const VatsimGeneralSchema = z.object({
    version: z.number(),
    /**
     * @deprecated
     */
    reload: z.number(),
    /**
     * @deprecated
     */
    update: z.string(),
    update_timestamp: z.string(),
    connected_clients: z.number(),
    unique_users: z.number(),
});

/**
 * Note: The docs do not completely align with actual returned data. The schemas reflect actual returned data structures.
 * @see https://vatsim.dev/api/data-api/get-network-data
 */
export const VatsimDataSchema = z.object({
    general: VatsimGeneralSchema,
    pilots: z.array(VatsimPilotSchema),
    controllers: z.array(VatsimControllerSchema),
    atis: z.array(VatsimAtisSchema),
    servers: z.array(VatsimServerSchema),
    prefiles: z.array(VatsimPrefileSchema),
    facilities: z.array(VatsimFacilitySchema),
    ratings: z.array(VatsimRatingSchema),
    pilot_ratings: z.array(VatsimPilotRatingSchema),
    military_ratings: z.array(VatsimMilitaryRatingSchema),
});

export type VatsimData = z.infer<typeof VatsimDataSchema>;
