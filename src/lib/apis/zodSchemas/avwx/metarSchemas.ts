import { z } from 'zod';

export const MetarTimeSchema = z.object({ dt: z.string().datetime() });

export const MetarWindDirectionSchema = z.object({ repr: z.string() });

export const MetarWindSpeedSchema = z.object({ repr: z.string() });

export const MetarVisibilitySchema = z.object({ repr: z.string() });

export const MetarTemperatureSchema = z.object({ repr: z.string() });

export const MetarDewpointSchema = z.object({ repr: z.string() });

export const MetarAltimeterSchema = z.object({ value: z.number() });

export const MetarUnitsSchema = z.object({
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
    time: MetarTimeSchema,
    wind_direction: MetarWindDirectionSchema,
    wind_speed: MetarWindSpeedSchema,
    visibility: MetarVisibilitySchema,
    temperature: MetarTemperatureSchema,
    dewpoint: MetarDewpointSchema,
    altimeter: MetarAltimeterSchema,
    flight_rules: z.string(),
    units: MetarUnitsSchema,
});

/**
 * This type only contains currently used fields. If you wish to use other fields returned by the API add them in this file.
 */
export type Metar = z.infer<typeof MetarSchema>;
