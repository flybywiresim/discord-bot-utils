import mongoose, { Schema } from 'mongoose';

const pollSchema = new Schema({
    guildID: String,
    title: String,
    description: String,
    duration: Number,
    closingTime: String,
    abstainAllowed: Boolean,
    notify: String,
    options: [{
        number: Number,
        value: String,
    }],
    isOpen: Boolean,
    messageID: String,
    moderatorID: String,
    channelID: String,
    votes: [{
        userID: String,
        optionNumber: Number,
    }],
});

export const Poll = mongoose.model('Poll', pollSchema);
