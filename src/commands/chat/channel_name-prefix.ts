import { EmbedBuilder, 
	Emoji,
	Guild, 
	GuildEmoji, 
	Message, 
	GuildChannel, 
	ChannelType, TextChannel } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const { isOwner } = require('/home/ubuntu/ep_bot/extras/functions')
const emojiRegex = require('emoji-regex');


export = {
    name: "name",
    aliases: [],
    type: CommandTypes.PrefixCommand,
    guildWhitelist: ['1135995107842195550', '801822272113082389'],
    roleWhitelist: ['1147864509344661644', '1148992217202040942','1147864509344661644','807811542057222176'],
    categoryWhitelist:[	'1147909067172483162',
                        '1147909156196593787',
                        '1147909539413368883',
                        '1147909373180530708',
                        '1147909282201870406',
                        '1147909200924643349',
                        '1140190313915371530',
    			'1203928376205905960',
                        '1232728117936914432',
                        '1192106199404003379',
                        '1192108950049529906',
                        '1225165761920630845',
                        '966458661469839440',
	    		'808109909266006087',
                        '825060923768569907'
			],
    cooldown: 30,
    async execute(message: Message): Promise<void> {
	try{
		if(message.channel.type !== ChannelType.GuildText) return;
                // This whole Block checks for the channel owner and if not channel owner
                 // if its not the channel owner, checks for the staff role
                 // if user is a staff member, they can run the command
                 // if user is a channel owner or a cowner on the channel / mentioned channel,
                 // then they are authorized.

                let getOwner = await isOwner(message.author.id)
                let checkStaff = await  message.guild.members.cache.get(message.author.id)
                let channel = message.channel.id
		let serverId = message.guild.id

                //handles null values
                let checkOwner = getOwner && getOwner.some((authorized) => authorized.channel === channel)
		

		  // object is guildId:RoleId

                const modRoleIdList: { [key: string]: string } = {
                        "1135995107842195550": "1148992217202040942",
                        "801822272113082389": "807826290295570432",
                 };

                const roleId = Object.entries(modRoleIdList).find(([key, val]) => key === serverId)?.[1];


                if(!checkOwner){
                        if(!(checkStaff.roles.cache.has(roleId))){
                                await message.reply('you must be an owner/cowner of this channel to run this command')
                                return;

                        }else if(checkStaff.roles.cache.has(roleId)){
                                console.log("Channel Info Ran In: ", message.channel.id, "by", message.author.id)
                        }
                }


	  	let newName;
	  	let stringContent = message.content.toString()
	  	newName = stringContent.split("name")
          	if(stringContent.endsWith("name")) {	  
			await message.reply("Please specify Channel Name")
		  	return;
		  }
	  	let channelWord;
	  	let channelName = ""

	  	if(String(newName).trimStart().startsWith("<")) {
			await message.reply("You can only use standard emojis")
			return;
		}
		const regex = emojiRegex();
                let emojiName;
		for (const match of String(newName).matchAll(regex)) {
                          emojiName = match[0]
                }
		if(emojiName) {
                       channelWord = String(newName).split(`${emojiName}`)[1].trimStart();
		       if(message.guild.id === '1135995107842195550'){
                       		channelName = String(channelName).concat(String(emojiName) + '・' + String(channelWord));
		       }else if(message.guild.id === '801822272113082389'){
			        channelName === String(channelName).concat('『'+String(emojiName)+'』'+String(channelWord));
		       }
                       await message.channel.edit({name: channelName})
                } else {
                       channelWord = String(newName)
		       if(message.guild.id === '1135995107842195550'){
                       		channelName = String(channelName).concat('・' + String(channelWord))
		       }else if(message.guild.id === '801822272113082389'){
			        String(channelName).concat('『』'+String(channelWord))
		       }
                       await message.channel.edit({name: channelName})
                }
	  	
		let embed = new EmbedBuilder()
                	.setTitle("Channel Name Change")
                	.setDescription(`channel name has been set to ${channelName}

				    *channel names can take up to 10 minutes to appear*`)
                	.setColor('#097969')
	   	await message.reply({embeds:[embed]})
	}catch(err)
  	{console.log(err)}
	  
    }
} as PrefixCommandModule;
