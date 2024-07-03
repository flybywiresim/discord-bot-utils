import { z } from 'zod';

export const TimeSchema = z.object({ dt: z.string().datetime() });

export const WindDirectionSchema = z.object({ repr: z.string() });

export const WindSpeedSchema = z.object({ repr: z.string() });

export const VisibilitySchema = z.object({ repr: z.string() });

export const TemperatureSchema = z.object({ repr: z.string() });

export const DewpointSchema = z.object({ repr: z.string() });

export const AltimeterSchema = z.object({ value: z.number() });

export const UnitsSchema = z.object({
    accumulation: z.string(),
    altimeter: z.string(),
    altitude: z.string(),
    temperature: z.string(),
    visibility: z.string(),
    wind_speed: z.string(),
});

/**
 * This schema only contains currently used fields. If you wish to use other fields returned by the API add them in this file.
 */
export const MetarSchema = z.object({
    station: z.string(),
    raw: z.string(),
    time: TimeSchema,
    wind_direction: WindDirectionSchema,
    wind_speed: WindSpeedSchema,
    visibility: VisibilitySchema,
    temperature: TemperatureSchema,
    dewpoint: DewpointSchema,
    altimeter: AltimeterSchema,
    flight_rules: z.string(),
    units: UnitsSchema,
});

/**
 * This type only contains currently used fields. If you wish to use other fields returned by the API add them in this file.
 */
export type Metar = z.infer<typeof MetarSchema>;
