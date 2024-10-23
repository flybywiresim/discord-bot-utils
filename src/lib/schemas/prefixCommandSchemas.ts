import mongoose, { Schema, Document } from 'mongoose';

export interface IPrefixCommandCategory extends Document {
    categoryId: mongoose.Schema.Types.ObjectId;
    name: string;
    emoji: string;
}

const prefixCommandCategorySchema = new Schema<IPrefixCommandCategory>({
    categoryId: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true,
        unique: true,
    },
    emoji: String,
});

export interface IPrefixCommandVersion extends Document {
    versionId: mongoose.Schema.Types.ObjectId;
    name: string;
    emoji: string;
    alias: string;
    enabled: boolean;
}

const prefixCommandVersionSchema = new Schema<IPrefixCommandVersion>({
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

export interface IPrefixCommandChannelDefaultVersion extends Document {
    channelId: string;
    versionId: string;
}

const prefixCommandChannelDefaultVersionSchema = new Schema<IPrefixCommandChannelDefaultVersion>({
    channelId: {
        type: String,
        required: true,
        unique: true,
    },
    versionId: {
        type: String,
        required: true,
    },
});

export interface IPrefixCommandContent extends Document{
    versionId: string;
    title: string;
    content?: string;
    image?: string;
}

const prefixCommandContentSchema = new Schema<IPrefixCommandContent>({
    versionId: {
        type: String,
        required: true,
    },
    title: String,
    content: String,
    image: String,
}, { autoCreate: false });

export interface IPrefixCommandPermissions extends Document {
    roles?: string[],
    rolesBlocklist?: boolean,
    channels?: string[],
    channelsBlocklist?: boolean,
    quietErrors?: boolean,
    verboseErrors?: boolean,
}

const prefixCommandPermissionsSchema = new Schema<IPrefixCommandPermissions>({
    roles: [String],
    rolesBlocklist: Boolean,
    channels: [String],
    channelsBlocklist: Boolean,
    quietErrors: Boolean,
    verboseErrors: Boolean,
}, { autoCreate: false });

export interface IPrefixCommand extends Document {
    commandId: mongoose.Schema.Types.ObjectId;
    categoryId: mongoose.Schema.Types.ObjectId;
    name: string;
    description: string;
    aliases: string[];
    isEmbed: boolean;
    embedColor?: string;
    contents: IPrefixCommandContent[];
    permissions: IPrefixCommandPermissions;
}

const prefixCommandSchema = new Schema<IPrefixCommand>({
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
    description: String,
    aliases: [{ type: String }],
    isEmbed: Boolean,
    embedColor: String,
    contents: [prefixCommandContentSchema],
    permissions: prefixCommandPermissionsSchema,
});

export const PrefixCommandCategory = mongoose.model('PrefixCommandCategory', prefixCommandCategorySchema);
export const PrefixCommandVersion = mongoose.model('PrefixCommandVersion', prefixCommandVersionSchema);
export const PrefixCommandContent = mongoose.model('PrefixCommandContent', prefixCommandContentSchema);
export const PrefixCommandPermissions = mongoose.model('PrefixCommandPermissions', prefixCommandPermissionsSchema);
export const PrefixCommandChannelDefaultVersion = mongoose.model('PrefixCommandChannelDefaultVersion', prefixCommandChannelDefaultVersionSchema);
export const PrefixCommand = mongoose.model('PrefixCommand', prefixCommandSchema);
