# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FlyByWire Simulations Discord bot - a moderation, utility, and support bot built with discord.js v14, TypeScript, and MongoDB. Requires Node.js 24.x.

## Build & Development Commands

This project uses **pnpm** (`pnpm-lock.yaml`, pinned via the `packageManager` field). Do not use npm/yarn — CI (`.github/workflows/pr.yaml`) and the lockfile are the source of truth. Run `corepack enable pnpm` (or `nvm use`, which honors `.nvmrc` → Node 24) to get the pinned toolchain.

```bash
pnpm install           # Install dependencies
pnpm run dev           # Start dev server with nodemon + ts-node (hot reload; type `rs` to restart)
pnpm run build         # Compile TypeScript to ./build (tsc, CommonJS, target ES2020)
pnpm run lint          # ESLint 9 flat config + Prettier (eslint.config.mjs, .prettierrc)
pnpm run lint-fix      # ESLint with auto-fix
pnpm run format        # Format src/ with Prettier
pnpm start             # Run compiled production build from ./build
```

There are no automated tests. Testing is done by running the bot locally with `pnpm run dev`. CI runs `pnpm run lint` and `pnpm run build` on every PR — both must pass.

## Environment Setup

1. `cp .env.example .env` — **`.env.example` is the source of truth for environment variables.** It documents every variable with inline notes; consult it rather than this file for the full list.
2. Set `BOT_SECRET` with your Discord bot token.
3. Set `NODE_CONFIG_ENV` to your config name (e.g., `development`), then create `config/<name>.json` by copying `config/staging.json` and replacing the guild/channel/role IDs with your test server's. `config/*` is gitignored except `staging.json` and `production.json`, so your dev config stays local.
4. On first run set `DEPLOY=true` to register slash commands, then set it back to `false` (Discord rate-limits command creation daily). Afterwards re-register with the `/deploy-commands` slash command.
5. Enable all **privileged gateway intents** in the Discord Developer Portal — the bot requests `MessageContent`, `GuildMembers`, and `GuildPresences` (see Client section).

**Most integrations are optional and degrade gracefully** — the bot boots without them, only the dependent feature is disabled:

- `MONGODB_URL` — without it, all database features (infractions, FAQs, birthdays, prefix commands, the Agenda scheduler) are skipped.
- AVWX tokens (`METAR_TOKEN`/`TAF_TOKEN`/`STATION_TOKEN`), `WOLFRAMALPHA_TOKEN` — gate the corresponding weather/query commands.
- `HEARTBEAT_*`, `BIRTHDAY_INTERVAL`, `CACHE_REFRESH_INTERVAL` — control whether/how often the matching scheduled jobs run.
- `BAN_APPEAL_URL`, `IMAGE_BASE_URL`, `CLOUDFLARE_*` — ban-appeal links, asset base URL, and CDN upload.

There is no docker-compose file in the repo (CONTRIBUTING.md references one, but it is absent). Run MongoDB via a local install or Atlas and point `MONGODB_URL` at it.

## Architecture

### Entry Point & Client

- `src/index.ts` - Loads dotenv, then dynamically imports the client.
- `src/client.ts` - Creates the Discord.js client with 7 gateway intents (`Guilds`, `GuildMembers`, `GuildMessages`, `MessageContent`, `GuildMessageReactions`, `GuildBans`, `GuildPresences` — three are privileged; no partials). Registers all events via `registerEvents()`, and on `SIGINT`/`SIGTERM` removes listeners, closes the Mongoose connection, and destroys the client.

### Command & Event Registration

Commands and events use a centralized array pattern:

- `src/commands/index.ts` - Imports all slash commands into a single `commandArray` (default export). Context menu commands are registered separately in `src/commands/context/index.ts`.
- `src/events/index.ts` - Imports all events into a single array (default export).
- A `SlashCommand`/`ContextMenuCommand` is `{ meta, callback, autocompleteCallback? }`, built with `slashCommand()`/`slashCommandStructure()`. The `meta` object IS the structure sent to Discord. Interaction handlers build a `Map` keyed by `meta.name` from the arrays to route incoming interactions.

### Command Deployment (non-obvious)

`src/scripts/deployCommands.ts` chooses the deployment scope by `NODE_ENV`:
- **Production** (`NODE_ENV=production`) → deploys **globally** (`Routes.applicationCommands`); global commands can take up to an hour to propagate.
- **Anything else** (dev/staging) → deploys **per-guild** to `constantsConfig.guildId` (`Routes.applicationGuildCommands`); guild commands are available immediately.

Deployment runs at startup only when `DEPLOY=true`, or on demand via the `/deploy-commands` command.

### Startup Sequence & Graceful Degradation

`src/events/ready.ts` runs a resilient, ordered startup where each integration is tried independently and its success/error tracked separately — a failure disables only that feature, it does not crash the bot:

1. Fetch & validate the configured guild (warn on any unexpected guild).
2. Deploy commands if `DEPLOY=true` (scope per above).
3. Set up the in-memory cache.
4. Connect MongoDB — **only if `MONGODB_URL` is set**.
5. Start the Agenda scheduler — only if MongoDB connected.
6. Register scheduled jobs (heartbeat, birthdays, cache refresh) — only if the scheduler is up and the relevant interval env var is set. Existing jobs are reconciled: rescheduled if the interval changed, left alone otherwise.
7. Hydrate the prefix-command caches — only if both cache setup and DB connection succeeded.
8. Post a startup status embed (DB/scheduler/cache state) to the `MOD_LOGS` channel, pinging `BOT_DEVELOPER`.

### Commands Structure (`src/commands/`)

- **`moderation/`** - Staff commands (infractions, slowmode, FAQs, rules, welcome, whois, clearMessages, roleAssignment, prefix command management, etc.).
- **`utils/`** - Public utilities (metar, taf, station, zulu, simbriefData, vatsim, github, birthday, locate, help, etc.).
- **`context/`** - Right-click user/message actions.

**`/functions/` convention:** commands with subcommands keep one handler file per subcommand in a sibling `functions/` folder (e.g. `infractions/functions/warn.ts`, `prefixCommands/functions/addCategory.ts`). The parent command file only does option parsing and routing. Cross-command logic lives here too — e.g. the `listInfractions` context menu delegates to `moderation/infractions/functions/listInfractions.ts`, the same handler the `infractions list` subcommand uses.

### Events System (`src/events/`)

Each event exports an `Event` object with a Discord.js event key and callback:

- `ready.ts` - Startup (see above).
- `slashCommandHandler.ts` / `contextInteractionHandler.ts` / `autocompleteHandler.ts` - Route interactions via the name→command Map; wrap the callback in try/catch and reply with an error embed.
- `messageCreateHandler.ts` - Prefix command (`.command`) handling (see Prefix Commands).
- `logging/` - `messageDelete`, `messageUpdate`, `detectBan`, `scamLogs`. **These do more than log:** `detectBan` polls the audit log and writes a `Ban` `Infraction` record (and DMs the ban-appeal URL); `scamLogs` deletes `@everyone` messages from non-staff, times the user out for 7 days, and writes a `ScamLog` `Infraction`. So infraction records originate from events, not just from moderation commands.

### Button Handling (two paradigms)

1. **Global router** — `src/events/buttonHandlers/buttonHandler.ts` handles `InteractionCreate` for buttons, splits `customId` on `_` into `[prefix, ...params]`, and switches on the prefix. Currently only `roleAssignment` is wired here (self-assignable roles via `roleAssignment_<roleId>`). Use this paradigm for buttons that must work after a restart.
2. **Inline collectors** — most interactive commands (clearMessages confirm/cancel, reportMessage flow, pagination, prefix-command version selection) handle their own buttons in-place via `awaitMessageComponent()` / `createMessageComponentCollector()` with a timeout. These are ephemeral to that command invocation.

### Library (`src/lib/`)

Barrel-exported from `src/lib/index.ts` - import everything via `import { ... } from '../../lib'`:

- `config.ts` - Parses the config JSON, resolves role-group/role-assignment names to IDs, and exports `constantsConfig` plus `imageBaseUrl`.
- `slashCommand.ts` / `contextMenuCommand.ts` / `autocomplete.ts` - Command interfaces and `*Structure()`/builder helpers; `AutocompleteCallback` type.
- `embed.ts` - `makeEmbed()` (auto-applies FBW_CYAN), `makeLines()`, `makeList()`.
- `replies.ts` - `Reply()` (ephemeral) / `EditReply()` with a `Color` enum (Error/Success/Info).
- `events.ts` - `Event` interface, `event()` helper, `registerEvents()`.
- `db.ts` - Mongoose connect / `closeMongooseConnection()`.
- `scheduler.ts` - Agenda setup; `define()`s the four scheduled jobs.
- `logger.ts` - Winston (`debug` in dev, `info` in prod; force with `DEBUG_MODE=true`).
- `durationInEnglish.ts` - ms → human-readable duration.
- `genericEmbedPagination.ts` / `infractionEmbedPagination.ts` - Prev/next button pagination (the infraction one renders tabbed category counts).
- `cache/cacheManager.ts` - In-memory cache (`cache-manager`, memory store) for prefix commands. Key prefixes: `PF_COMMAND`, `PF_VERSION`, `PF_CATEGORY`, `PF_CHANNEL_VERSION`. Exposes per-entity load/clear/refresh helpers.
- `schemas/` - Mongoose models: `infractionSchema`, `faqSchema`, `birthdaySchema`, and `prefixCommandSchemas` (six related models: command, category, version, channel-default-version, content, permissions).
- `schedulerJobs/` - `sendHeartbeat`, `postBirthdays`, `refreshInMemoryCache`, `autoDisableSlowMode`.

### Prefix Commands (Legacy subsystem)

Prefix commands (`.commandname`) are a major subsystem distinct from slash commands, stored in MongoDB and served from the in-memory cache:

- **Versions & aliases:** a command can have multiple content versions (e.g. per aircraft). The first token after the prefix may be a version alias; otherwise the version defaults to `GENERIC`, which can be overridden per-channel by a channel-default-version. Disabled versions fall back appropriately.
- **Permissions:** each command has role and channel allow/block lists (`rolesBlocklist`/`channelsBlocklist`) plus `quietErrors`/`verboseErrors` flags. Failed-permission messages auto-delete after `prefixCommandPermissionDelay` ms (10s).
- **Rendering:** content renders as an embed or plain text. When the resolved version is `GENERIC` and more than one version exists, version-selection buttons are shown with a 60-second collector before the choice expires.
- Managed via the `/prefix-commands` command tree in `src/commands/moderation/prefixCommands/` (subcommand groups: categories, versions, commands, content, channel-default-version), with autocomplete backed by live MongoDB queries.

### Configuration System

Uses `node-config`, loaded by `NODE_CONFIG_ENV`. `config/staging.json` and `config/production.json` are committed; dev configs are gitignored. `src/lib/config.ts` parses the file and **resolves named role groups to actual role ID lists** before exporting `constantsConfig`, whose shape is:

- `channels`, `roles`, `threads` - named ID maps (e.g. `constantsConfig.channels.MOD_LOGS`).
- `roleGroups` - named groups (`BOT`, `STAFF`, `SUPPORT`, `TEAM`) resolved to arrays of role IDs.
- `roleAssignmentIds` - groups of self-assignable roles surfaced by `roleAssignment` buttons.
- `aircraftTypeList` - aircraft → `prefix:roleId` mappings.
- `commandPermission.MANAGE_SERVER` (`"32"`), `colors.FBW_CYAN`, `guildId`, `prefixCommandPrefix` (`.`), `prefixCommandPermissionDelay`, `units`.
- `modLogExclude` / `userLogExclude` - user IDs (e.g. test bots) excluded from logging.

## Key Patterns

### Adding a New Slash Command

1. Create file in the appropriate subfolder (e.g., `src/commands/utils/yourcommand.ts`).
2. Define structure with `slashCommandStructure()` and export with `slashCommand()`.
3. Import and add it to `commandArray` in `src/commands/index.ts` (context commands go in `src/commands/context/index.ts`).
4. Set `DEPLOY=true` once, or run `/deploy-commands` in Discord, to register.

```typescript
import { ApplicationCommandType } from 'discord.js';
import { slashCommand, slashCommandStructure, makeEmbed } from '../../lib';

const data = slashCommandStructure({
    name: 'commandname',
    description: 'Command description',
    type: ApplicationCommandType.ChatInput,
});

export default slashCommand(data, async ({ interaction }) => {
    return interaction.reply({ embeds: [makeEmbed({ description: 'Response' })] });
});
```

### Subcommands

Use `ApplicationCommandOptionType.Subcommand` in options, then route with `interaction.options.getSubcommand()` (call `getSubcommandGroup()` first for nested groups). Put each branch's handler in a sibling `functions/` folder.

### Command Permissions

Set `default_member_permissions: constantsConfig.commandPermission.MANAGE_SERVER` to restrict a command, then configure the actual role/channel access in Discord's server settings (Integrations → Bot → Command). Add a comment specifying the intended overrides — code only sets the `MANAGE_SERVER` gate.

### Deferring & Ephemeral Replies

For slow commands, `await interaction.deferReply()` then use `interaction.editReply()`. For quick ephemeral feedback use `Reply(message, Color.Error)` / `EditReply()`.

### Context Menu Commands & Autocomplete

Context menu commands use `contextMenuCommandStructure()` / `contextMenuCommand()` with `ApplicationCommandType.User` or `.Message`; access the target via `interaction.targetId`. For autocomplete, pass an `AutocompleteCallback` as the third arg to `slashCommand()` and set `autocomplete: true` on the option — Discord does not enforce the returned choices, so validate the input in the command callback.

## PR Guidelines

- Target the **`staging`** branch for all pull requests.
- Branch naming: `feat: description` or `fix: description`.
- CI gates every PR (`.github/workflows/`): `pnpm run lint` and `pnpm run build` must pass.
- **Add an entry to `.github/CHANGELOG.md`** — `verify-changelog.yml` fails the PR otherwise, unless it carries the `skip changelog` label.
- Test locally with `pnpm run dev` before marking ready for review.
