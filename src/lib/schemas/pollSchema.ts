import mongoose, { Schema } from 'mongoose';

const pollSchema = new Schema({
    guildID: String,
    title: String,
    description: String,
    duration: Number,
    closingTime: Date,
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
    channelID: String,
});

export const Poll = mongoose.model('Poll', pollSchema);
