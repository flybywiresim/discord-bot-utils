import mongoose, { Schema } from 'mongoose';

const pollSchema = new Schema({
    guildID: String,
    title: String,
    duration: Number,
    abstainAllowed: Boolean,
    notify: String,
    options: [{
        number: Number,
        value: String,
        votes: [{ userID: String }],
    }],
    isOpen: Boolean,
    messageID: String,
    moderatorID: String,
});

export const Poll = mongoose.model('Poll', pollSchema);
