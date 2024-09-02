import mongoose, { Schema } from 'mongoose';

const prefixCommandCategorySchema = new Schema({
    categoryId: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true,
        unique: true,
    },
    emoji: String,
});

const prefixCommandVersionSchema = new Schema({
    versionId: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true,
        unique: true,
    },
    emoji: {
        type: String,
        required: true,
        unique: true,
    },
    alias: {
        type: String,
        required: true,
        unique: true,
    },
    enabled: Boolean,
});

const prefixCommandChannelDefaultVersionSchema = new Schema({
    channelId: {
        type: String,
        required: true,
    },
    versionId: {
        type: String,
        required: true,
    },
});

const prefixCommandContentSchema = new Schema({
    versionId: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: String,
    image: String,
});

const prefixCommandChannelPermissionSchema = new Schema({
    type: {
        type: String,
        required: true,
    },
    channelId: {
        type: String,
        required: true,
    },
});

const prefixCommandRolePermissionSchema = new Schema({
    type: {
        type: String,
        required: true,
    },
    roleId: {
        type: String,
        required: true,
    },
});

const prefixCommandSchema = new Schema({
    commandId: mongoose.Schema.Types.ObjectId,
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PrefixCommandCategory',
        required: true,
    },
    name: {
        type: String,
        required: true,
        unique: true,
    },
    aliases: [{ type: String }],
    isEmbed: Boolean,
    embedColor: String,
    contents: [prefixCommandContentSchema],
    channelPermissions: [prefixCommandChannelPermissionSchema],
    rolePermissions: [prefixCommandRolePermissionSchema],
});

export const PrefixCommandCategory = mongoose.model('PrefixCommandCategory', prefixCommandCategorySchema);
export const PrefixCommandVersion = mongoose.model('PrefixCommandVersion', prefixCommandVersionSchema);
export const PrefixCommandChannelDefaultVersion = mongoose.model('PrefixCommandChannelDefaultVersion', prefixCommandChannelDefaultVersionSchema);
export const PrefixCommand = mongoose.model('PrefixCommand', prefixCommandSchema);
