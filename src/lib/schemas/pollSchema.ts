import mongoose, { Schema } from 'mongoose';

const pollSchema = new Schema({
    guildID: String,
    title: String,
    duration: Number,
    abstainAllowed: Boolean,
    notify: String,
    options: Map,
    isOpen: Boolean,
    votes: Map,
    messageID: String,
    moderatorID: String,
});

export const Poll = mongoose.model('Poll', pollSchema);
