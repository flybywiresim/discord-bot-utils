import { z } from 'zod';

export const OrganiserSchema = z.object({
    region: z.nullable(z.string()),
    division: z.nullable(z.string()),
    subdivision: z.nullable(z.string()),
    organised_by_vatsim: z.boolean(),
});

export const AirportSchema = z.object({ icao: z.string() });

export const RouteSchema = z.object({
    departure: z.string(),
    arrival: z.string(),
    route: z.string(),
});

export const DataSchema = z.object({
    id: z.number(),
    type: z.enum(['Event', 'Controller Examination', 'VASOPS Event']),
    name: z.string(),
    link: z.string(),
    organisers: z.array(OrganiserSchema),
    airports: z.array(AirportSchema),
    routes: z.array(RouteSchema),
    start_time: z.string(),
    end_time: z.string(),
    short_description: z.string(),
    description: z.string(),
    banner: z.string(),
});

/**
 * @see https://vatsim.dev/api/events-api/1.0.0/list-events
 */
export const VatsimEventsSchema = z.object({ data: z.array(DataSchema) });

export type VatsimEvents = z.infer<typeof VatsimEventsSchema>;
