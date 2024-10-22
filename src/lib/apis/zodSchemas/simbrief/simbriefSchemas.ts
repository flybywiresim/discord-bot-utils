import { z } from 'zod';

const SimBriefFetchSchema = z.object({ status: z.string() });

const SimBriefParamsSchema = z.object({
    user_id: z.string(),
    time_generated: z.string(),
    airac: z.string(),
});

const SimBriefAircraftSchema = z.object({
    name: z.string(),
    internal_id: z.string(),
});

const SimBriefOriginSchema = z.object({
    icao_code: z.string(),
    plan_rwy: z.string(),
});

const SimBriefDestinationSchema = z.object({
    icao_code: z.string(),
    plan_rwy: z.string(),
});

const SimBriefGeneralSchema = z.object({ route: z.string() });

/**
 * This schema only contains currently used fields. If you wish to use other fields returned by the API add them in this file.
 */
export const SimbriefFlightPlanSchema = z.object({
    fetch: SimBriefFetchSchema,
    params: SimBriefParamsSchema,
    aircraft: SimBriefAircraftSchema,
    origin: SimBriefOriginSchema,
    destination: SimBriefDestinationSchema,
    general: SimBriefGeneralSchema,
});

/**
 * This type only contains currently used fields. If you wish to use other fields returned by the API add them in this file.
 */
export type SimbriefFlightPlan = z.infer<typeof SimbriefFlightPlanSchema>;
