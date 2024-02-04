import { Event } from '../lib';

import ready from './ready';
import scamLogs from './logging/scamLogs';
import detectBan from './logging/detectBan';
import slashCommandHandler from './slashCommandHandler';
import contextInteractionHandler from './contextInteractionHandler';
import roleAssignmentHandler from './roleAssignmentHandler';
import messageDelete from './logging/messageDelete';
import messageUpdate from './logging/messageUpdate';
import pollHandler from './pollHandler';

export default [
    ready,
    scamLogs,
    detectBan,
    slashCommandHandler,
    contextInteractionHandler,
    roleAssignmentHandler,
    messageDelete,
    messageUpdate,
    pollHandler,
] as Event[];
