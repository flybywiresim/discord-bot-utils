import { z } from 'zod';

const MilitaryRatingSchema = z.object({
    id: z.number(),
    short_name: z.string(),
    long_name: z.string(),
});

const PilotRatingSchema = z.object({
    id: z.number(),
    short_name: z.string(),
    long_name: z.string(),
});

const RatingSchema = z.object({
    id: z.number(),
    short: z.string(),
    long: z.string(),
});

const FacilitySchema = z.object({
    id: z.number(),
    short: z.string(),
    long: z.string(),
});

const FlightPlanSchema = z.object({
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

const PrefileSchema = z.object({
    cid: z.number(),
    name: z.string(),
    callsign: z.string(),
    flight_plan: FlightPlanSchema,
    last_updated: z.string(),
});

const ServerSchema = z.object({
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

const AtisSchema = z.object({
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

const ControllerSchema = z.object({
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

const PilotSchema = z.object({
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
    flight_plan: z.nullable(FlightPlanSchema),
    logon_time: z.string(),
    last_updated: z.string(),
});

const GeneralSchema = z.object({
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
    general: GeneralSchema,
    pilots: z.array(PilotSchema),
    controllers: z.array(ControllerSchema),
    atis: z.array(AtisSchema),
    servers: z.array(ServerSchema),
    prefiles: z.array(PrefileSchema),
    facilities: z.array(FacilitySchema),
    ratings: z.array(RatingSchema),
    pilot_ratings: z.array(PilotRatingSchema),
    military_ratings: z.array(MilitaryRatingSchema),
});

export type VatsimData = z.infer<typeof VatsimDataSchema>;
export type General = z.infer<typeof GeneralSchema>;
export type Pilot = z.infer<typeof PilotSchema>;
export type Controller = z.infer<typeof ControllerSchema>;
export type Atis = z.infer<typeof AtisSchema>;
export type Server = z.infer<typeof ServerSchema>;
export type Prefiles = z.infer<typeof PrefileSchema>;
export type FlightPlan = z.infer<typeof FlightPlanSchema>;
export type Facility = z.infer<typeof FacilitySchema>;
export type Rating = z.infer<typeof RatingSchema>;
export type PilotRating = z.infer<typeof PilotRatingSchema>;
export type MilitaryRating = z.infer<typeof MilitaryRatingSchema>;
