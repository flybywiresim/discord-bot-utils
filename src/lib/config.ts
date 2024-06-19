import botConfig from 'config';
import { exit } from 'process';
import { Logger } from './logger';

// imageBaseUrl - Below takes the IMAGE_BASE_URL entry from the `env` and strips the trailing `/` if present
const originalBaseUrl = `${process.env.IMAGE_BASE_URL}`;
const imageBaseUrl = originalBaseUrl.endsWith('/') ? originalBaseUrl.slice(0, -1) : originalBaseUrl;
export { imageBaseUrl };

interface roleAssignmentId {
  group: string;
  roles: { id: string; label: string }[];
}

// Config constants that are directly used in code should be mandatory,
// which means they have to be explicitly mentioned in the interface below.
//
// Constants that are only part of role groups or role assignment IDs are
// not mandatory, as they can be dynamic.
interface Config {
  aircraftTypeList: {
    [x: string]: string;
  };
  channels: {
    A32NX_SUPPORT: string;
    FAQ: string;
    FLIGHT_SCHOOL: string;
    KNOWN_ISSUES: string;
    MOD_ALERTS: string;
    MOD_LOGS: string;
    ROLES: string;
    SCAM_REPORT_LOGS: string;
    TEAM: string;
    USER_LOGS: string;
    VIDEOS: string;
    [x: string]: string;
  };
  colors: {
    FBW_CYAN: string;
    [x: string]: string;
  };
  commandPermission: {
    MANAGE_SERVER: string;
    [x: string]: string;
  };
  guildId: string;
  modLogExclude: string[];
  roleAssignmentIds: roleAssignmentId[];
  roleGroups: {
    [x: string]: string[];
  };
  roles: {
    ADMIN_TEAM: string;
    BOT_DEVELOPER: string;
    COMMUNITY_SUPPORT: string;
    DEVELOPMENT_TEAM: string;
    FBW_EMERITUS: string;
    MEDIA_TEAM: string;
    MODERATION_TEAM: string;
    [x: string]: string;
  };
  threads: {
    BIRTHDAY_THREAD: string;
    COUNT_THREAD: string;
    [x: string]: string;
  };
  units: {
    CELSIUS: string;
    DEGREES: string;
    [x: string]: string;
  };
  userLogExclude: string[];
}

let parsedConfig: Config;
try {
  parsedConfig = botConfig as unknown as Config;
  if (!parsedConfig.commandPermission.MANAGE_SERVER) {
    // Making sure this is always set, even if an empty string is given
    parsedConfig.commandPermission.MANAGE_SERVER = '32';
  }
  const { roles, roleGroups, roleAssignmentIds } = parsedConfig;
  // Parsing Role groups
  const newRoleGroups: { [x: string]: string[] } = {};
  for (const group in roleGroups) {
    if (Object.prototype.hasOwnProperty.call(roleGroups, group)) {
      const groupRoles = roleGroups[group];
      const groupRoleIds = [];
      for (let index = 0; index < groupRoles.length; index++) {
        const groupRole = groupRoles[index];
        if (groupRole in roles) {
          groupRoleIds.push(roles[groupRole]);
        }
      }
      newRoleGroups[group] = groupRoleIds;
    }
  }
  parsedConfig.roleGroups = newRoleGroups;
  // Parsing Role assignment IDs
  const newRoleAssignmentIds: roleAssignmentId[] = [];
  for (let i = 0; i < roleAssignmentIds.length; i++) {
    const roleAssignmentId = roleAssignmentIds[i];
    const { group, roles: roleAssignmentIdRoles } = roleAssignmentId;
    const newRoleAssignmentIdRoles = [];
    for (let j = 0; j < roleAssignmentIdRoles.length; j++) {
      const roleAssignmentIdRole = roleAssignmentIdRoles[j];
      const { id, label } = roleAssignmentIdRole;
      if (id in roles) {
        newRoleAssignmentIdRoles.push({ id: roles[id], label });
      }
    }
    newRoleAssignmentIds.push({ group, roles: newRoleAssignmentIdRoles });
  }
  parsedConfig.roleAssignmentIds = newRoleAssignmentIds;
} catch (e) {
  Logger.error(`Failed to load config: ${JSON.stringify(e)}`);
  exit(1);
}

const constantsConfig = parsedConfig;
export { constantsConfig };
