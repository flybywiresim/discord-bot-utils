import { z } from 'zod';

export const TelexCountSchema = z.number();

export type TelexCount = z.infer<typeof TelexCountSchema>;
