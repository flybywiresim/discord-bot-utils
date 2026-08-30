import mongoose from 'mongoose';
import { getConn } from '../db';
import { Logger } from '../logger';
import { Infraction } from '../schemas/infractionSchema';

export type InfractionType = 'Warn' | 'Timeout' | 'ScamLog' | 'Ban' | 'Unban' | 'Note';

export interface AddInfractionOptions {
    userID: string;
    infractionType: InfractionType;
    moderatorID: string;
    reason: string;
    duration?: string;
    date?: Date;
}

export type AddInfractionResult =
    { saved: true; infractionID: string } | { saved: false; reason: 'no-connection' | 'error'; error?: unknown };

/**
 * Appends an infraction to the user's record, creating the record when the user has none. Never throws.
 */
export async function addInfraction(options: AddInfractionOptions): Promise<AddInfractionResult> {
    const { userID, infractionType, moderatorID, reason, duration, date } = options;

    if (!getConn()) {
        return { saved: false, reason: 'no-connection' };
    }

    const infractionID = new mongoose.Types.ObjectId();
    const newInfraction = {
        infractionType,
        moderatorID,
        reason,
        date: date ?? new Date(),
        infractionID,
        ...(duration !== undefined && { duration }),
    };

    try {
        await Infraction.updateOne({ userID }, { $push: { infractions: newInfraction } }, { upsert: true });
        Logger.info(`Infraction - Recorded ${infractionType} infraction ${infractionID} for user ${userID}`);
        return { saved: true, infractionID: infractionID.toString() };
    } catch (error) {
        Logger.error(`Infraction - Failed to record ${infractionType} infraction for user ${userID}: ${error}`);
        return { saved: false, reason: 'error', error };
    }
}
