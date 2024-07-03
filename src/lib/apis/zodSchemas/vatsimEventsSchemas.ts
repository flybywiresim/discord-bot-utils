import { z } from 'zod';

export const VatsimOrganiserSchema = z.object({
    region: z.nullable(z.string()),
    division: z.nullable(z.string()),
    subdivision: z.nullable(z.string()),
    organised_by_vatsim: z.boolean(),
});

export const VatsimAirportSchema = z.object({ icao: z.string() });

export const VatsimRouteSchema = z.object({
    departure: z.string(),
    arrival: z.string(),
    route: z.string(),
});

export const VatsimEventsDataSchema = z.object({
    id: z.number(),
    type: z.enum(['Event', 'Controller Examination', 'VASOPS Event']),
    name: z.string(),
    link: z.string(),
    organisers: z.array(VatsimOrganiserSchema),
    airports: z.array(VatsimAirportSchema),
    routes: z.array(VatsimRouteSchema),
    start_time: z.string(),
    end_time: z.string(),
    short_description: z.string(),
    description: z.string(),
    banner: z.string(),
});

/**
 * @see https://vatsim.dev/api/events-api/1.0.0/list-events
 */
export const VatsimEventsSchema = z.object({ data: z.array(VatsimEventsDataSchema) });

export type VatsimEvents = z.infer<typeof VatsimEventsSchema>;
