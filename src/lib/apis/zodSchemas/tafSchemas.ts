import { z } from 'zod';

export const ForecastSchema = z.object({ raw: z.string() });

/**
 * This schema only contains currently used fields. If you wish to use other fields returned by the API add them in this file.
 */
export const TafSchema = z.object({
    raw: z.string(),
    station: z.string(),
    forecast: z.array(ForecastSchema),
});
/**
 * This type only contains currently used fields. If you wish to use other fields returned by the API add them in this file.
 */
export type TAF = z.infer<typeof TafSchema>;
