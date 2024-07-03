import { z } from 'zod';

const FetchSchema = z.object({ status: z.string() });

const ParamsSchema = z.object({
    user_id: z.string(),
    time_generated: z.string(),
    airac: z.string(),
});

const AircraftSchema = z.object({
    name: z.string(),
    internal_id: z.string(),
});

const OriginSchema = z.object({ icao_code: z.string() });

const DestinationSchema = z.object({ icao_code: z.string() });

const GeneralSchema = z.object({ route: z.string() });

/**
 * This schema only contains currently used fields. If you wish to use other fields returned by the API add them in this file.
 */
export const SimbriefFlightPlanSchema = z.object({
    fetch: FetchSchema,
    params: ParamsSchema,
    aircraft: AircraftSchema,
    origin: OriginSchema,
    destination: DestinationSchema,
    general: GeneralSchema,
});

/**
 * This type only contains currently used fields. If you wish to use other fields returned by the API add them in this file.
 */
export type SimbriefFlightPlan = z.infer<typeof SimbriefFlightPlanSchema>;
