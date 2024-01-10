import mongoose, { Schema } from 'mongoose';

const prefixCommandSchema = new Schema({
    commandId: mongoose.Schema.Types.ObjectId,
    categoryId: {
        type: String,
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
});

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
    enabled: Boolean,
});

const prefixCommandContentSchema = new Schema({
    contentId: mongoose.Schema.Types.ObjectId,
    commandId: {
        type: String,
        required: true,
    },
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
    channelPermissionId: mongoose.Types.ObjectId,
    commandId: {
        type: String,
        required: true,
    },
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
    rolePermissionId: mongoose.Schema.Types.ObjectId,
    commandId: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    roleId: {
        type: String,
        required: true,
    },
});

export const PrefixCommand = mongoose.model('PrefixCommand', prefixCommandSchema);
export const PrefixCommandCategory = mongoose.model('PrefixCommandCategory', prefixCommandCategorySchema);
export const PrefixCommandVersion = mongoose.model('PrefixCommandVersion', prefixCommandVersionSchema);
export const PrefixCommandContent = mongoose.model('PrefixCommandContent', prefixCommandContentSchema);
export const PrefixCommandChannelPermission = mongoose.model('PrefixCommandChannelPermission', prefixCommandChannelPermissionSchema);
export const PrefixCommandRolePermission = mongoose.model('PrefixCommandRolePermission', prefixCommandRolePermissionSchema);
