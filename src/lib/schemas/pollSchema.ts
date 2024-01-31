import mongoose, { Schema } from 'mongoose';

const pollSchema = new Schema({
    guildID: String,
    title: String,
    options: [String],
    duration: Number,
    maxVotes: Number,
    notifyRoles: [String],
    votes: Map,
    messageID: String,
    moderatorID: String,
});

export const Poll = mongoose.model('Birthday', pollSchema);
