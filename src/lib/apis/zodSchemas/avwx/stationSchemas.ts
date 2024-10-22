import { z } from 'zod';

export const AVWXRunwaySchema = z.object({
    length_ft: z.number(),
    width_ft: z.number(),
    ident1: z.string(),
    ident2: z.string(),
});

export const AVWXStationSchema = z.object({
    city: z.string(),
    country: z.string(),
    elevation_ft: z.number(),
    elevation_m: z.number(),
    icao: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    name: z.string(),
    runways: z.nullable(z.array(AVWXRunwaySchema)),
    type: z.string(),
    website: z.nullable(z.string().url()),
    wiki: z.nullable(z.string().url()),
});

export type AVWXStation = z.infer<typeof AVWXStationSchema>;
