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

	try{
	    let messageContent = message.content
	    let channelName;
	    let digitRegex = new RegExp(/^(?:[+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*)(?:[eE][+-]?\d+)?)$/g)
	    let digitChannel = [...messageContent.matchAll(digitRegex)] 
	    if (messageContent.includes('https')) {
		    let regex = new RegExp(/()\d+$/)
		    channelName = messageContent.match(regex) 
	    }else if(digitChannel[0]){
		    channelName = digitChannel[0]
	    }else if(message.mentions.channels.map(m => m).length) {
		    channelName = message.mentions.channels.first()
	    }
	
	    channelName = String(channelName).replace(/\D/g, '');

	    let user = message.author.id
	    let channelList = ''
	
	    const favoritedChannels = await checkfav(message.author.id);
	    
	    if(favoritedChannels === false ){
		await addfav(user,channelName)
		channelList = `${channelName}`
		// avoid a race condition
		let NewChannelEmbed1 = new EmbedBuilder()
                	.setTitle("Quick Channel List")
                	.setFooter({text:message.author.tag, iconURL:message.author.displayAvatarURL()})
                	.setTimestamp()
                	.setColor('#097969')
                	.setDescription(`${channelList}`);
		await message.reply({embeds:[NewChannelEmbed1]})
		return;
	    }
	    const isFavorite = favoritedChannels.some((fav) => fav.channel === channelName)
	    if(isFavorite) {
		    await message.reply('You already have this channel as a favorite')
		    return;
	    } else {
	    	await addfav(user,channelName)
		await message.reply(`<#${channelName}> added!`)
	    }


	  }catch(err)
         {console.log(err)}
    },
});
