import { z } from 'zod';

export const ForecastSchema = z.object({ raw: z.string() });

export const TafSchema = z.object({
    raw: z.string(),
    station: z.string(),
    forecast: z.array(ForecastSchema),
});

export type TAF = z.infer<typeof TafSchema>;
