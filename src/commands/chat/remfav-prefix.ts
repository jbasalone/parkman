import { Message } from "discord.js";
import { PrefixCommand } from '../../handler';
const {checkfav, remfav} = require('/home/ubuntu/ep_bot/extras/functions');

export default new PrefixCommand({
    name: "remfav",
    aliases: ["Remfav", 'remchan'],
	// 1113339391419625572 - Epic Wonderland
	// 1135995107842195550 - Epic Park
	// 839731097473908767 - Blackstone
	// 871269916085452870 - Luminescent

	allowedGuilds: ['1135995107842195550','1113339391419625572', '839731097473908767','871269916085452870'],
	allowedRoles: ['1143236724718317673','1147864509344661644', '1148992217202040942','1143236724718317673',
					'807811542057222176',
					'1113407924409221120', // epic wonderland staff
					'1113451646031241316', // epic wonderland users
					'845499229429956628', // Blackstone Staff
					'839731097633423389', // Blackstone Users
		      '1130783135156670504', // Luminescent Users
		      '871393325389844521', // Luminescent Leiutenint
				],
  async execute(message: Message): Promise<void> {
    try {
      console.log('remfav command called:', message.content);

      const parts = message.content.trim().split(/\s+/);

      // Get all mentioned channel IDs
      const mentionedIds = message.mentions.channels.map(ch => ch.id);

      // Get all raw channel IDs from arguments (skip the prefix/command)
      const rawIds = parts
        .filter(part => /^\d{17,19}$/.test(part))
        // Don't double count mentions
        .filter(id => !mentionedIds.includes(id));

      // Combine and dedupe
      const allChannelIds = [...new Set([...mentionedIds, ...rawIds])];

      if (!allChannelIds.length) {
        await message.reply('Please mention at least one channel or provide channel IDs to remove.');
        return;
      }

      const favoritedChannels = await checkfav(message.author.id);
      const favSet = new Set(favoritedChannels.map(fav => fav.channel));

      const removed = [];
      const notFound = [];

      for (const channelId of allChannelIds) {
        if (favSet.has(channelId)) {
          await remfav(message.author.id, channelId);
          removed.push(channelId);
        } else {
          notFound.push(channelId);
        }
      }

      let replyMsg = '';
      if (removed.length)
        replyMsg += `✅ Removed from favorites: ${removed.map(id => `<#${id}> (\`${id}\`)`).join(', ')}\n`;
      if (notFound.length)
        replyMsg += `⚠️ Not marked as favorite: ${notFound.map(id => `\`${id}\``).join(', ')}`;

      await message.reply(replyMsg.trim() || 'No valid channels provided.');
    } catch (err) {
      console.error('remfav error:', err);
      await message.reply('An error occurred while removing favorites.');
    }
  }
});