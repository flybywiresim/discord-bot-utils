import { z } from 'zod';

export const WolframAlphaErrorSchema = z.object({
    code: z.number(),
    msg: z.string(),
});

export const WolframAlphaSubpodSchema = z.object({
    title: z.string(),
    plaintext: z.string({ message: 'Only appears if the requested result formats include plain text.' }),
});

export const WolframAlphaPodSchema = z.object({
    title: z.string(),
    error: z.union([z.boolean(), WolframAlphaErrorSchema]),
    position: z.number(),
    scanner: z.string(),
    id: z.string(),
    numsubpods: z.number(),
    primary: z.optional(z.boolean()),
    subpods: z.array(WolframAlphaSubpodSchema),
});

const BaseQueryResultSchema = z.object({
    error: z.union([z.boolean(), WolframAlphaErrorSchema]),
    numpods: z.number(),
    version: z.string(),
    datatypes: z.string(),
    timing: z.number(),
    timedout: z.union([z.string(), z.number()]),
    parsetiming: z.number(),
    parsetimedout: z.boolean(),
    recalculate: z.string(),
});

const SuccessQueryResultSchema = BaseQueryResultSchema.extend({
    success: z.literal(true),
    pods: z.array(WolframAlphaPodSchema),
});

const NoSuccessQueryResultSchema = BaseQueryResultSchema.extend({ success: z.literal(false) });

export const WolframAlphaQueryResultSchema = z.discriminatedUnion('success', [SuccessQueryResultSchema, NoSuccessQueryResultSchema]);

export const WolframAlphaDataSchema = z.object({ queryresult: WolframAlphaQueryResultSchema });

/**
 * This type only includes currently used properties. If you wish to extend its functionality, add the relevant schemas in this file.
 */
export type WolframAlphaData = z.infer<typeof WolframAlphaDataSchema>;
