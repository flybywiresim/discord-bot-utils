import { SlashCommand } from '../lib';
import ping from './utils/ping';
import deployCommands from './moderation/deployCommands';
import avatar from './utils/avatar';
import liveFlights from './utils/liveFlights';
import memberCount from './utils/memberCount';
import metar from './utils/metar';
import pullRequest from './utils/pullRequest';
import roleInfo from './utils/roleInfo';
import simbriefData from './utils/simbriefData';
import station from './utils/station';
import taf from './utils/taf';
import wolframAlpha from './utils/wolframAlpha';
import zulu from './utils/zulu';
import cacheUpdate from './moderation/cacheUpdate';
import infractions from './moderation/infractions/infractions';
import slowmode from './moderation/slowmode/slowmode';
import whois from './moderation/whois';
import faq from './moderation/faq/faq';
import rules from './moderation/rules';
import welcome from './moderation/welcome';
import searchFaq from './utils/searchFaq';
import roleAssignment from './moderation/roleAssignment';
import birthday from './utils/birthday/birthday';
import count from './utils/count';
import vatsim from './utils/vatsim/vatsim';
import help from './utils/help';

const commandArray: SlashCommand[] = [
    ping,
    deployCommands,
    avatar,
    liveFlights,
    memberCount,
    metar,
    pullRequest,
    roleInfo,
    simbriefData,
    station,
    taf,
    wolframAlpha,
    zulu,
    cacheUpdate,
    infractions,
    slowmode,
    whois,
    faq,
    rules,
    welcome,
    searchFaq,
    roleAssignment,
    birthday,
    count,
    vatsim,
    help,
];

export default commandArray;
