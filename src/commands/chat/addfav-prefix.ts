// src/addfav-prefix.ts

import { Message, EmbedBuilder } from "discord.js";
import { PrefixCommand } from '../../handler';
const {checkfav, addfav} = require('/home/ubuntu/ep_bot/extras/functions');

export default new PrefixCommand({
    name: "addfav",
    aliases: ["Addfav"],
	// 1113339391419625572 - Epic Wonderland
	// 1135995107842195550 - Epic Park
	// 839731097473908767 - Blackstone
	// 871269916085452870 - Luminescent
	allowedGuilds: ['1135995107842195550','1149713429561622609','839731097473908767','871269916085452870'],
	allowedRoles: ['1147864509344661644', '1148992217202040942','1147864509344661644','807811542057222176',
		'1113451646031241316', // epic wonderland users
		'839731097633423389', // blackstone users
		"1130783135156670504", // Luminescent Users
		'871393325389844521' // Luminescent Leiutenint

	],
  async execute(message: Message): Promise<void> {
    try {
      const user = message.author.id;
      const messageContent = message.content.trim().split(/\s+/);

      // 1. Gather all mentioned channels
      const mentionedIds = message.mentions.channels.map(ch => ch.id);

      // 2. Gather all raw numeric IDs (skip prefix/command)
      const rawIds = messageContent
        .filter(part => /^\d{17,19}$/.test(part))
        .filter(id => !mentionedIds.includes(id));

      // 3. Combine, dedupe
      const allChannelIds = [...new Set([...mentionedIds, ...rawIds])];

      if (!allChannelIds.length) {
        await message.reply('Please mention at least one channel or provide channel IDs to add.');
        return;
      }

      // 4. Check which are already favorited
      const favoritedChannels = await checkfav(user);
      const favSet = new Set(favoritedChannels.map(fav => fav.channel));

      const added = [];
      const already = [];

      for (const channelId of allChannelIds) {
        if (favSet.has(channelId)) {
          already.push(channelId);
        } else {
          await addfav(user, channelId);
          added.push(channelId);
        }
      }

      let replyMsg = '';
      if (added.length)
        replyMsg += `✅ Added: ${added.map(id => `<#${id}> (\`${id}\`)`).join(', ')}\n`;
      if (already.length)
        replyMsg += `⚠️ Already favorited: ${already.map(id => `<#${id}> (\`${id}\`)`).join(', ')}`;

      await message.reply(replyMsg.trim() || 'No valid channels provided.');

    } catch (err) {
      console.error('addfav error:', err);
      await message.reply('An error occurred while adding favorites.');
    }
  }
});