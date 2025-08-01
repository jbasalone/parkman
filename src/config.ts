import { Config, getLogChannelPresetEmbed } from './handler';
import {
  type ContextMenuCommandInteraction,
  GatewayIntentBits,
  type Interaction,
  Message,
  type MessageReplyOptions,
} from 'discord.js';

const defaultConfig: Config = {
  getPrefix: (guildId: string) => {
    const custom = defaultConfig.customPrefixes.find(cp => cp.guildId === guildId);
    return custom?.prefix || 'ep'; // 'ep' is the default prefix
  },
  customPrefixes: [
    {
      guildId: "839731097473908767",
      prefix: "bs"
    }
  ],

  ownerId: '936693149114449921',
  eventsFolder: 'events',
  commandsFolder: 'commands',
  componentsFolder: 'components',
  defaultIntents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,   // <-- THIS LINE is critical!
    GatewayIntentBits.MessageContent,
  ],
  /* More customizability coming soon */
  deniedCommandReplies: {
    general: 'You are not allowed to use this command.',
    specific: {
      allowedUsers: 'This command is restricted to specific users.',
      blockedUsers: 'You have been blocked from using this command.',
      allowedChannels: 'This command can only be used in specific channels.',
      blockedChannels: 'This channel is not allowed to use this command.',
      allowedCategories: 'This command is restricted to specific categories.',
      blockedCategories: 'This category is blocked from using this command.',
      allowedGuilds: 'This command is only available in specific servers.',
      blockedGuilds: 'This server is not allowed to use this command.',
      allowedRoles: 'You need a specific role to use this command.',
      blockedRoles: 'You have a role that is blocked from using this command.',
      restrictedToOwner: 'Only the bot owner can use this command.',
      restrictedToNSFW: 'This command can only be used in NSFW channels.',
      isDisabled: 'This command is currently disabled.',
      custom: 'You are not allowed to use this command.',
    },
    cooldowns: {
      user: 'You can use this command again in {time} seconds.',
      guild: 'This command is on cooldown for this server. Try again in {time} seconds.',
      global: 'This command is on global cooldown. Try again in {time} seconds.',
    },
  },

  logChannelConfig: {
    channelId: '1150881816664883300',
    message: async (
        context: Interaction | ContextMenuCommandInteraction | Message,
        commandName: string,
        commandType: string,
    ): Promise<MessageReplyOptions> => {
      return {
        embeds: [getLogChannelPresetEmbed(context, commandName, commandType)],
      };
    },
  },
};

export default defaultConfig;
