import mongoose, { Schema } from 'mongoose';

const infractionSchema = new Schema({
  userID: String,
  infractions: [
    {
      // All infractions must contain the below fields
      infractionType: String, // Ban, Kick, Timeout, ScamLog, Note, etc.
      moderatorID: String,
      reason: String,
      date: Date,
      infractionID: mongoose.Schema.Types.ObjectId,
      // Additional fields specific to each infraction type
      duration: String, // Used for timeouts
      _id: false,
    },
  ],
});

export const Infraction = mongoose.model('Infraction', infractionSchema);
