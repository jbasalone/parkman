import {ActionRowBuilder,
	ButtonBuilder, 
	ButtonStyle,
	ChannelManager, 
	EmbedBuilder, 
	Channel, 
	ChannelType,
	Message, 
	MessageManager, 
	MessageCollector } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const {getisland, isOwner} = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    name: "slowmode",
    aliases: ["smon", "Slowmodeon", "slowon"],
    type: CommandTypes.PrefixCommand,
    roleWhitelist: ['1147864509344661644', '1148992217202040942','1246691890183540777'],
    categoryWhitelist: ["1147909067172483162", "1147909156196593787", "1140190313915371530"],
    async execute(message: Message): Promise<void> {
	try{
		let checkOwner = await isOwner(message.author.id)
                if(checkOwner[0].channel !== message.channel.id) {
                        await message.reply('you must be an owner/cowner of this channel to run this command')
                        return;
                }
		if(message.channel.type !== ChannelType.GuildText) return;
                let island = await getisland(message.channel.id)
		let users = [island.user,
				island.cowner1,
				island.cowner2,
				island.cowner3,
				island.cowner4,
				island.cowner5,
				island.cowner6,
				island.cowner7]
            	for(let i = 0; i < 7; i++) {
                	if(users[i]) message.channel.permissionOverwrites.edit(users[i], 
									       {ManageMessages: true})
		}

		let embed1 = new EmbedBuilder()
			.setTitle("Channel Manager:  Slowmode")
                	.setDescription(`Slowmode Enabled. Choose Time 
                                *to disable slowmode, use command ep slowoff*`)
                	.setColor(`#097969`)
		
		 const row: any = new ActionRowBuilder()
        	.addComponents(
			new ButtonBuilder()
                                .setCustomId("2_sec")
                                .setLabel("2 Secs")
                                .setStyle(ButtonStyle.Secondary)
                                .setEmoji("🐢"),
                	new ButtonBuilder()
                        	.setCustomId("5_sec")
                        	.setLabel("5 Secs")
                        	.setStyle(ButtonStyle.Secondary)
                        	.setEmoji("🐢"),
                	new ButtonBuilder()
                        	.setCustomId("10_sec")
                        	.setLabel("10 Secs")
                        	.setStyle(ButtonStyle.Secondary)
                        	.setEmoji("🐢"),
			new ButtonBuilder()
                                .setCustomId("30_sec")
                                .setLabel("30 Secs")
                                .setStyle(ButtonStyle.Secondary)
                                .setEmoji("🐢"),
			new ButtonBuilder()
                                .setCustomId("45_sec")
                                .setLabel("45 Secs")
                                .setStyle(ButtonStyle.Secondary)
                                .setEmoji("🐢")
                	)

   		await message.reply({embeds: [embed1], components: [row]},) 
	}catch(err)
  	{console.log(err)}
    }
} as PrefixCommandModule;
