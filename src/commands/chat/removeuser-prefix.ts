import { GuildChannel, GuildMember,  ChannelType, Message, ChannelManager,  EmbedBuilder,  MessageMentions} from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const {isOwner, removeuser, removecowners, getisland, addedusers} = require('/home/ubuntu/ep_bot/extras/functions');

export = {
    name: "removeuser",
    aliases: ["Removeuser", "remuser", "deluser"],
    type: CommandTypes.PrefixCommand,
    roleWhitelist: ['1147864509344661644', '1148992217202040942','1246691890183540777'],
    categoryWhitelist: ['1147909067172483162',
                        '1147909156196593787',
                        '1147909539413368883',
                        '1147909373180530708',
                        '1147909282201870406',
                        '1147909200924643349',
                        '1140190313915371530'],
    async execute(message: Message): Promise<void> {
	try{
		let checkOwner = await isOwner(message.author.id)
                if(checkOwner[0].channel !== message.channel.id) {
                        await message.reply('you must be an owner/cowner of this channel to run this command')
                        return;
                }
	    	if(message.channel.type !== ChannelType.GuildText) {
			return;
	    	}
	    	if (!message.mentions.users.map(m => m).length) {
			await message.reply('Did you forget to add the user?')
		    	return;
	    	}
	    	const id = await message.mentions.users.first().id
	    	const checkAdds = await addedusers(message.channel.id)
	    	const channelInfo = await getisland(message.channel.id) 
	    	const cleanid = await id.replace(/\D/g, '')
	    	const isAdded = checkAdds.some((added) => added.user === cleanid)
	    	const cownersArray = [channelInfo.cowner1, 
		    			channelInfo.cowner2, 
	    				channelInfo.cowner3, 
					channelInfo.cowner4, 
					channelInfo.cowner5, 
					channelInfo.cowner6,
					channelInfo.cowner7]
            	const filteredOwners: string[] = cownersArray.filter((s): s is string => !!(s));
           
	    	let cowners = ' '
	    	let cownerRole = '1246691890183540777'

	    	if(id  === message.author.id){
                	await message.reply("Seriously? <a:ep_bozabonk:1164312811468496916>")
		  	return;
	    	}

	    	if(isAdded) {
	    		await removeuser(cleanid, message.channel.id)
	    	}

	    	Object.entries(channelInfo).forEach(([key, value]) => {
			cowners = cowners.concat(`${key}:${value},`)
		});

	    	let cownersTemp = cowners.split(",").map(pair => pair.split(":"));
	    	const result = Object.fromEntries(cownersTemp);

	    	function getOwner(obj, value) {
			return Object.keys(obj)
		    		.filter(key => obj[key] === value);
	    	}

	    	let remuser = getOwner(result, cleanid)
	    	if(remuser[0]){
			let ownerid = remuser[0].slice(-1)
		    	await removecowners(message.channel.id, ownerid)
		    	let channelCowner = message.guild.members.cache.get(ownerid)
		    	await channelCowner.roles.remove(cownerRole)
	    	}

	    	await message.channel.permissionOverwrites.delete(message.mentions.members.first().id)

	    	let embed = new EmbedBuilder()
	    		.setTitle("Channel Manager: Remove User")
			.setDescription(`<@!${message.mentions.members.first().id}> has been removed
				 \n *to add user back use ep adduser*`)
			.setColor(`#097969`)

	   	await message.reply({embeds:[embed]})
	}catch(err)
  	{console.log(err)}
    },
} as PrefixCommandModule;
