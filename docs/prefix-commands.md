# Prefix Commands

This documentation is meant for Discord server admins/moderators and for Developers. It'll first cover the General Concepts, then the Use for admins/moderators and finally the design so Developers understand how things have been set up.

## Table of Content

- [Prefix Commands](#prefix-commands)
  - [Table of Content](#table-of-content)
  - [Overview](#overview)
    - [Detailed Concepts](#detailed-concepts)
      - [Command](#command)
      - [Command Content](#command-content)
      - [Category](#category)
      - [Version](#version)
      - [Version Behavior](#version-behavior)
      - [Channel Default Version](#channel-default-version)
      - [Permission](#permission)
        - [Permission Behavior](#permission-behavior)
        - [Errors](#errors)
  - [Managing Prefix Commands](#managing-prefix-commands)
    - [Requirements and Bot Setup](#requirements-and-bot-setup)
    - [Management Capabilities](#management-capabilities)
    - [Managing Categories](#managing-categories)
      - [Listing Categories](#listing-categories)
      - [Adding a Category](#adding-a-category)
      - [Modifying a Category](#modifying-a-category)
      - [Deleting a Category](#deleting-a-category)
    - [Managing Versions](#managing-versions)
      - [Listing Versions](#listing-versions)
      - [Adding a Version](#adding-a-version)
      - [Modifying a Version](#modifying-a-version)
      - [Deleting a Version](#deleting-a-version)
    - [Managing Commands](#managing-commands)
      - [Listing commands](#listing-commands)
      - [Adding a command](#adding-a-command)
      - [Modifying a command](#modifying-a-command)
      - [Deleting a command](#deleting-a-command)
    - [Managing Content](#managing-content)
    - [Showing Content](#showing-content)
    - [Setting Content](#setting-content)
      - [Deleting Content](#deleting-content)
    - [Managing Command Permissions](#managing-command-permissions)
      - [Showing Permissions](#showing-permissions)
      - [Setting Permissions](#setting-permissions)
      - [Managing Channels](#managing-channels)
      - [Managing Roles](#managing-roles)
    - [Managing Channel Default Versions](#managing-channel-default-versions)
      - [Showing the Channel Default Version](#showing-the-channel-default-version)
      - [Setting the Channel Default Version](#setting-the-channel-default-version)
      - [Deleting the Channel Default Version](#deleting-the-channel-default-version)
    - [Showing Commands for a Category](#showing-commands-for-a-category)
  - [Design and Development Overview](#design-and-development-overview)
    - [In-Memory Cache](#in-memory-cache)
      - [Cache Design](#cache-design)
        - [Command Cache](#command-cache)
        - [Versions Cache](#versions-cache)
      - [Categories Cache](#categories-cache)
      - [Channel Default Version Cache](#channel-default-version-cache)
      - [Cache Refresh](#cache-refresh)
    - [Message Handler](#message-handler)

## Overview

Prefix Commands are dynamically controlled commands that are accessed by using a prefix. For example, if the prefix is configured to be `.`, and the command is `hello`, the user in Discord would execute `.hello`.

These commands are not hard coded in the bot, and instead they are configured through typical `/`-commands and then stored in the MongoDB.

Additionally, there's a set of features that make these commands very flexible in use:

- **Categories**
    Commands are categorized for identifying the purpose or use of the command. Categories are manage dynamically through `/`-commands and stored in MongoDB.

- **Versions**
    The content of commands are defined per Version. A version can be used to provide different content based on the context in which the command is executed. By default, there is a hard-coded `GENERIC` version available, more can be added and managed dynamically through `/`-commands and stored in MongoDB. If multiple versions exist, and no version is specified during the execution, the `GENERIC` version is shown, with buttons to select the version to be shown.

- **Content**
    For each version, it is possible (but not a must) to set the content of a command. The content is static information that is managed with `/`-commands and stored in MongoDB. Depending on the version requested, the content is loaded and shown. Content contains a Title, Body and Image.

- **Permissions**
    Two types of permissions exist: Channel permissions and Role permissions. Using permissions it is possible to block or allow the use of a command in certain channels or by certain roles.

- **Channel Default Versions**
    For every channel, a specific version can be set as the default. In this case, even if there are multiple versions, if the command is executed without a version specified, the version set as the default for that channel is shown.

### Detailed Concepts

#### Command

Commands only contain the basic information that is needed to use them:

- `name`
    A command has a name, this is the main way to execute the command, in combination with the configured prefix. This is a required attribute.
- `category`
    The category a command belongs to, a command can only belong to a single category. This is a required attribute.
- `description`
    The description of commands gives a short and brief overview of what the command is used for. This is a required attribute.
- `aliases`
    A comma separated list for aliases for this command, each alias can be used to call the command instead of the name of the command. This is an optional attribute. Default value is empty.
- `is_embed`
    A boolean attribute that identifies if the output should be posted as an Embed. If set to `False`, it will be shown as a regular text output, which is useful for simple image commands, or for simple links. This is an optional attribute. Default value is `False`.
- `embed_color`
    Embeds in Discord have a color to the left, which can be used to give it a special look. By setting this value, you can change the default `FBW_CYAN` to other special colors. Colors are defined in the Config JSON file. This is an optional attribute. Default value is `FBW_CYAN` (only value currently in the `production.json` config file).

Note that a Command does not contain any information about the content itself. This is because the content is specific per version and is described below.

#### Command Content

Content contains the actual information that is shown to the user when executing the command. Depending on the configuration of the command itself, this content will be displayed as an Embed or as standard text. The following attributes are available:

- `version`
    The version this content applies to, this is a reference to one of the existing versions in the bot. This is a required attribute.
- `title`
    The title of the content, this will be shown as the title of the Embed, or as the first bold line of the text output in case the command is not an embed. This is a required attribute.
- `content`
    A markdown capable string that identifies the actual content of the specified version. It can be up to 2048 Unicode characters, including emojis. This is an optional attribute. The default value is an empty (`null`), in which case it will not be shown as part of the output.
- `image`
    A URL that refers to an image that should be shown as part of the content if the command is an Embed. For text-style commands, the URL should be part of the content itself so Discord automatically loads it as a preview. This is an optional attribute. The default value is empty (`null`).

The `image` behavior can be surprising, but is chosen because it is not possible to just 'add' a message to a text-style response, unless if it is uploaded, and the decision was made to not upload an image very time the command is executed. What can be done is use markdown to load the image using the link syntax. Discord will then automatically load it as a preview.

#### Category

Categories are used to group commands together. This is mostly useful for when the help command is called to get the list of available commands for a specific category. It groups them together and makes it easy to identify. Categories have the following attributes:

- `name`
    The name as how it should be shown to the users and in any output. This is a required attribute.
- `emoji`
    An emoji to identify the category, this will be shown next to the category whenever shown. This is an optional attribute. The default value is empty (`null`), in which case it isn't shown.

#### Version

Versions are useful if you want the same command to have different contents based on the context in which it is executed. An example use for FlyByWire Simulations is to use it to have a single command that gives different output based on the product for which it is requested. Later the impact of Versions will be described more. Versions have the following attributes:

- `name`
    A name for the version, this is how the version is identified in the different commands on how to manage the content of commands. This is a required attribute.
- `emoji`
    The emoji associated with the version. When a command is executed without any version context, a GENERIC content will be displayed that offers the user the choice to get the details for a specific version. It does so by showing the emojis as buttons for the user to select. This is a required attribute.
- `alias`
    This is a command alias for the version. By executing `<prefix><alias> <command>`, the user can get the content for a specific version directly, instead of going through the GENERIC content. This is a required attribute.
- `is_enabled`
    A boolean attribute that can enable or disable a version. When this is set to `False`, the version will not be exposed to users. It will not show up in the selection of versions for the GENERIC content, and the alias will not work. This allows for versions and the content for those versions to be created ahead of enabling them. This is an optional attribute. The default value is `False`.

#### Version Behavior

Users can execute commands in two different ways, and they each result in different behavior. Any time a non-GENERIC version is mentioned, it must be enabled. Disable versions will never show up:

- `<prefix><command>`
    This is the direct way of executing a command, depending on the available content, several things might happen:
  - If no Channel Default Version is configured for the channel in which the command is executed:
    - GENERIC version and one or more other versions have content:
        The GENERIC content is shown and the user is given a choice underneath it with buttons containing the emjois of the other versions with content. When the user clicks on one of the buttons, the GENERIC content is removed and a new message is send with the content of the selected version.
    - Only GENERIC version has content:
        The GENERIC content is shown, and the user is not given a choice of other versions, as there is no choice available.
    - No GENERIC content is set:
        No response is given to the user:
    - No content is set at all:
        No response is given to the user.
  - If a Channel Default Version is configured for the channel in which the command is executed:
    - Content is set for the Channel Default Version:
        The content for that version is shown to the user directly.
    - No content is set for the Channel Default Version, but it does exist for the GENERIC version:
        The content for the GENERIC version is shown, but no selection buttons are shown.
    - No content is set for the Channel Default version, and no content exists for the GENERIC version:
        No response is given to the user.
    - No content is set at all:
        No response is given to the user.
- `<prefix><version alias> <command>`
    This directly requests the content for the specified version:
  - Content is set for the specified version:
      The content for the specified version is shown to the user directly.
  - No content is set for the specified version, GENERIC version and one or more other versions have content:
      The GENERIC content is shown and the user is given a choice underneath it with buttons containing the emjois of the other versions with content. When the user clicks on one of the buttons, the GENERIC content is removed and a new message is send with the content of the selected version.
  - Content is not set for the specified version and only GENERIC version has content:
      The GENERIC content is shown, and the user is not given a choice of other versions, as there is no choice available.
  - No content is set for the specified version and no GENERIC content is set:
      No response is given to the user.
  - No content is set at all:
      No response is given to the user.

#### Channel Default Version

It is possible to set a version as the default for a specific channel. By doing so, whenever someone executes the command directly (`<prefix><command>` in that channel, it will automatically default to that version and not first post the GENERIC version with choices. This bypasses the choice menu and allows for an optimized experience for users. Two attributes need to be provided during configuration:

- `channel`
    The Discord channel to which the version should be defaulted to. This is a required attribute.
- `version`
    The version that should be the default for this channel. It is possible to select a disabled version for this, but if you do so and the command is executed in the channel, no output will be shown. This is a required attribute.

#### Permission

Permissions can be set on commands so there are limitations to who can use the command and/or in which channels they can be used. The permission behavior is described below. Permissions have the following attributes:

- `roles`
    A list of Discord roles that either have access or do not have access to the command. This is an optional attribute. The default is an empty list, which results in the roles of the user not being checked.
- `role-blocklist`
    A boolean attribute that identifies if the list of roles is blocked from using the command (`True`) or allowed to use the command (`False`). This is an optional attribute. The default value is `False`, meaning that if a `roles` list is set, only users with at least one of those roles can execute the command.
- `channels`
    A list of Disord channels in which the command can either be executed or not executed. This is an optional attirubute. The default is an empty list, which results in the channel not being checked.
- `channel-blocklist`
    A boolean attribute that identifies if the list of channels is blocked from command execution (`True`) or allowed to execute the command in (`False`). This is an optional attribute. The default value is `False`, meaning that if a `channels` list is set, the command is only allowed to be executed in one of those channels.
- `quiet-errors`
    A boolean attribute, which if set to `True` will not display any warning to the user and will quietly fail the command execution if the permissions do not allow the execution of the command. This is an optional attribute. The default value is `False`.
- `verbose-errors`
    A boolean attribute, which if set to `True` will show detailed output about the permission violated and who (role violation) or where (channel violation) the command can be executed. This is an optional attribute. The default value is `False`.

##### Permission Behavior

Permissions are checked in the following flow:

- If there is a list of `roles` defined, the user is checked if they have any of the roles.
  - If `role-blocklist` is `False` and the user *does not* have any of the roles, the execution of the command is blocked.
  - If `role-blocklist` is `True` and the user *does* have any of the roles, the execution of the command is blocked.
- If there is a list of `channels` defined, the list is checked to see if the channel in which the command is executed, is part of the list.
  - If `channel-blocklist` is `False` and the command *is not* executed in any of the channels, the execution of the command is blocked.
  - If `channel-blocklist` is `True` and the command *is* executed in any of the channels, the execution of the command is blocked.

##### Errors

By default, when a command is blocked from execution, a message is shown that the execution is blocked either because of a role permission, or a channel permission. These messages are generic and do not reveal any detail about which role or channel needs to be present (blocklist is `False`), or needs to be absent (blocklist is `True`).

When `verbose-errors` is `True`, the message is enriched with information about which roles or channels are allowed (blocklist is `False`), or blocked (blocklist is `True`).

When `quiet-errors` is `True`, no message is send at all.

If both are set to `True`, `quiet-errors` takes precedence.

## Managing Prefix Commands

### Requirements and Bot Setup

The bot will require a MongoDB environment set up. There are a few settings to configure:

- **Config JSON**:
  - `prefixCommandPrefix`
        A String that will be the prefix for command that will be used by the user to execute commands. For example `.` to execute commands like `.help`
  - `prefixCommandPermissionDelay`
        A number in milliseconds that identifies the delay before the message about invalid permissions is deleted.

- **Environment Variable**:
  - `CACHE_REFRESH_INTERVAL`
        A number in milliseconds that is used to automatically refresh the cache from the database, to make sure the cache remains up to date.

### Management Capabilities

High level, the following capabilities exist from a management perspective, each with their own `/`-command:

- Manage Categories
  - `/prefix-commands categories list [search_text]`
  - `/prefix-commands categories add <name> [emoji]`
  - `/prefix-commands categories modify <category> [name] [emoji]`
  - `/prefix-commands categories delete <category>`
- Manage Versions
  - `/prefix-commands versions list [search_text]`
  - `/prefix-commands versions add <name> <emoji> <alias> [is_enabled]`
  - `/prefix-commands versions modify <version> [name] [emoji] [alias] [is_enabled]`
  - `/prefix-commands versions delete <version> [force]`
- Manage Commands
  - `/prefix-commands commands list [search_text]`
  - `/prefix-commands commands add <name> <category> <description> [aliases] [is_embed] [embed_color]`
  - `/prefix-commands commands modify <command> [name] [category] [description] [aliases] [is_embed] [embed_color]`
  - `/prefix-commands commands <command>`
- Manage Content for Commands
  - `/prefix-commands content show <command> <version>`
  - `/prefix-commands content set <command> <version>`
  - `/prefix-commands content delete <command> <version>`
- Manage Permissions for Commands
  - `/prefix-command-permissions show <command>`
  - `/prefix-command-permissions settings <command> [roles-blocklist] [channels-blocklist] [quiet-errors] [verbose-errors]`
  - `/prefix-command-permissions channels add <command> <channel>`
  - `/prefix-command-permissions channels remove <command> <channel>`
  - `/prefix-command-permissions roles add <command> <role>`
  - `/prefix-command-permissions roles remove <command> <role>`
- Manage Channel Default Versions for Channels
  - `/prefix-commands channel-default-version show <channel>`
  - `/prefix-commands channel-default-version set <channel> <version>`
  - `/prefix-commands channel-default-version delete <channel>`
- Showing available Commands per Category
  - `/prefix-help <category> [search]`

Below is a deeper dive in each of those. The deep-dives will not contain any details on the attributes themselves, those have been described above.

### Managing Categories

#### Listing Categories

It is possible to get a list of all categories, or a list of filtered categories, using the following command:

`/prefix-commands categories list [search_text]`

In this command, if the `search_text` is empty, all categories are shown. If it is set, any category containing the provided string will be listed.

#### Adding a Category

Adding a category is done using the command below. A name must be provided, and must be unique. An emoji can optionally be provided to have a nice representation of the category.

`/prefix-commands categories add <name> [emoji]`

#### Modifying a Category

To modify a category, use the command below. When executing the command, you have to select the category you want to modify. This is an automatically generated list from the existing categories. Then you provide an optional new name and new emoji. If you do not provide a new value, the original setting is kept.

`/prefix-commands categories modify <category> [name] [emoji]`

#### Deleting a Category

You can delete a category by using the below command. This will fail if there's still commands part of the category.

`/prefix-commands categories delete <category>`

### Managing Versions

#### Listing Versions

It is possible to get a list of all versions, or a list of filtered versions, using the following command:

`/prefix-commands versions list [search_text]`

In this command, if the `search_text` is empty, all versions are shown. If it is set, any version containing the provided string will be listed.

#### Adding a Version

Adding a version is done using the command below. A name, emoji and alias must be provided, and they must be unique. A version can optionally be enabled.

`/prefix-commands versions add <name> <emoji> <alias> [is_enabled]`

#### Modifying a Version

To modify a version, use the command below. When executing the command, you have to select the version you want to modify. This is an automatically generated list from the existing versions. Then you provide an optional new name, new emoji, new alias and if you want to enable or disable it. If you do not provide a new value, the original setting is kept.

`/prefix-commands versions modify <version> [name] [emoji] [alias] [is_enabled]`

#### Deleting a Version

You can delete a version by using the below command. This will fail if there's still content or channel default versions configured of the version unless force is enabled. Deleting a version with force will automatically delete any content and channel default versions referencing it.

`/prefix-commands versions delete <version> [force]`

### Managing Commands

#### Listing commands

It is possible to get a list of all commands, or a list of filtered commands, using the following command:

`/prefix-commands commands list [search_text]`

In this command, if the `search_text` is empty, all commands are shown. If it is set, any command containing the provided string will be listed.

#### Adding a command

Adding a command is done using the command below. A name, category and description must be provided. The name must be unique. A command can optionally have aliases. By default, a command is not an Embed, but this can be enabled and a color for the embed can be selected.

`/prefix-commands commands add <name> <category> <description> [aliases] [is_embed] [embed_color]`

#### Modifying a command

To modify a command, use the command below. When executing the command, you have to select the command you want to modify. This is an automatically generated list from the existing commands. Then you provide an optional new name, new category, new description, new aliases, if you want to make it an embed or not, and what color the embed should have. If you do not provide a new value, the original setting is kept.

`/prefix-commands commands modify <command> [name] [category] [description] [aliases] [is_embed] [embed_color]`

#### Deleting a command

You can delete a command by using the below command. Deleting a command will automatically delete all content for it, as well as its permissions.

`/prefix-commands commands <command>`

### Managing Content

### Showing Content

It is possible to show to show the content of a command and version by using the below command. You must provide a command and version.

`/prefix-commands content show <command> <version>`

### Setting Content

To set the content of a command, execute the below command. You must provide a command and version.

`/prefix-commands content set <command> <version>`

When executing this command, a window will pop open that will have a form asking for the title (required), content (optional) and image URL (optional). If the content was already set, it will be prefilled so it is easy to modify. You will have 2 minutes to fill in the fields.

It is strongly advised that you prepare the content and just copy/paste it into the form, instead of typing it out in the form itself, as it might time out.

**It is best to always create content for the GENERIC version for every command, as it is a fallback and default in many cases.**

#### Deleting Content

If you want to remove the content for a command and version entirely, you can do so using the below command. You must provide a command and version.

`/prefix-commands content delete <command> <version>`

### Managing Command Permissions

#### Showing Permissions

To show the permission settings of a command, execute the following command. You must select a command. It will show an embed with all the settings, roles and channels that are configured for the command.

`/prefix-command-permissions show <command>`

#### Setting Permissions

You can set the different settings for a command using the following command. You must select a command, but the rest of the attributes are optional. If you do not provide a new value, the original setting is kept.

`/prefix-command-permissions settings <command> [roles-blocklist] [channels-blocklist] [quiet-errors] [verbose-errors]`

#### Managing Channels

The list of channels to which the permissions apply can be set using the following commands. For simplicity, managing the list is done by adding or removing channels. You must provide the command and channel. If you try to remove a channel that isn't in the list, or try to add a channel that is already in the list, nothing will happen.

`/prefix-command-permissions channels add <command> <channel>`
`/prefix-command-permissions channels remove <command> <channel>`

#### Managing Roles

The list of roles to which the permissions apply can be set using the following commands. For simplicity, managing the list is done by adding or removing roles. You must provide the command and channel. If you try to remove a channel that isn't in the list, or try to add a channel that is already in the list, nothing will happen.

`/prefix-command-permissions roles add <command> <role>`
`/prefix-command-permissions roles remove <command> <role>`

### Managing Channel Default Versions

#### Showing the Channel Default Version

To show the channel default version for a specific channel, execute the following command. A channel must be provided. If no channel default version is set, it will let you know.

`/prefix-commands channel-default-version show <channel>`

#### Setting the Channel Default Version

Setting the default version for a channel can be done with the below command. You must provide the channel and the version.

`/prefix-commands channel-default-version set <channel> <version>`

#### Deleting the Channel Default Version

To remove a channel default version, and return a channel to use the generic version again by default, you can execute the below command. A channel must be provided.

`/prefix-commands channel-default-version delete <channel>`

### Showing Commands for a Category

It is possible for any user, regardless of role and permissions, to list all the existing prefix commands for a specific category, by using the below command. This command has an optional search, any command within the category that matches the search, will be shown with it's name, versions, aliases and description.

`/prefix-help <category> [search]`

## Design and Development Overview

A few items should be highlighted in how the design of this solution works, most importantly around the caching system and the message handling.

### In-Memory Cache

As all prefix commands are stored in MongoDB, if there was no local in-memory cache, for every time someone started a message with the prefix, the bot would need to go to MongoDB to check if it existed, retrieve the necessary details, including version details, content information and permissions. This would cause a lot of activity towards the database, and given the database is not hosted together with the bot, this could cause significant delays in handling the commands.

To avoid these problems, an in-memory cache is set up when the bot starts up. During startup, it will fill the cache with all the data from the database. The following objects are currently cached:

- Commands, including
  - Content
  - Permissions
- Versions
- Categories
- Channel Default Versions

#### Cache Design

The in-memory cache is a simple key/value pair cache that is fully stored in memory. To distinguish between the different types of objects, the key is prefixed with a specific string that identifies the type of object.

##### Command Cache

The prefix for commands is set as `PF_COMMAND`. For each command, the command is stored potentially multiple times:

- Once for the name of the command, in lower case (`PF_COMMAND:<name.toLowerCase()>`).
- Once for every alias of the command, in lower case (`PF_COMMAND:<alias.toLowerCase()>`).

In each case, the entire command object is stored as the value. This is done for the efficient retrieval of the command when executed by a user, either by its name, or by its alias.

Every time the command, content or permissions for a command is added, modified or deleted, the cache is refreshed for that command.

##### Versions Cache

The prefix for versions is set as `PF_VERSION`. For each version the version is stored twice:

- Once for the name of the version, in lower case (`PF_VERSION:<name.toLowerCase()>`).
- Once for the MongoDB ID of the version (`PF_VERSION:<_id>`).

In each case, the entire version object is stored as the value. The latter case is done as in several cases, a version will be referenced by ID and this optimizes the access to versions.

Every time a version is added, modified or deleted, the cache is refreshed for that version.

#### Categories Cache

The prefix for categories is set as `PF_CATEGORY`. For each category the category is stored once for the name of the category, in lower case (`PF_CATEGORY:<name.toLowerCase()>`).

In each case, the entire category object is stored as the value.

Every time a category is added, modified or deleted, the cache is refreshed for that category.

#### Channel Default Version Cache

The prefix for channel default versions is set as `PF_CHANNEL_VERSION`. For each channel default version the channel default version is stored once for the channel ID of the channel (`PF_CHANNEL_VERSION:<channel ID>`).

In each case, the entire channel default version object is stored as the value.

Every time a channel default version is added, modified or deleted, the cache is refreshed for that channel default version.

#### Cache Refresh

Periodically, the cache will be updated automatically using the scheduler. The interval is configurable using an environment variable `CACHE_REFRESH_INTERVAL`.

When the cache is refreshed, it will do the following steps:

1. Fetch all existing items from the DB.
2. Fetch all keys from the cache.
3. Loop over all keys found in cache.
   1. Verify the item still exists in the items from the DB. If not, delete the cache key.
4. Update or Add all objects from the DB.

### Message Handler

A new Message Handler has been created that listens for all message creations. It takes the following steps:

TODO: Add diagram - to be drawn
