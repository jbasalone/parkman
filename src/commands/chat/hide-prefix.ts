import { PrefixCommand } from '../../handler';
import { Message, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
const { isOwner } = require('/home/ubuntu/ep_bot/extras/functions')

export default new PrefixCommand({
    name: "hide",
    aliases: ["Hide", "unhide", "Unhide"],
    // 1113339391419625572 - Epic Wonderland
    // 1135995107842195550 - Epic Park
    // 839731097473908767 - Blackstone
    allowedGuilds: ['1135995107842195550','1113339391419625572', '839731097473908767'],
    allowedRoles: ['1147864509344661644', '1148992217202040942','1147864509344661644','807811542057222176',
                    '1113407924409221120', //epic wonderland staff
	    	        '1113451646031241316', // epic wonderland users
                    '845499229429956628', // Blackstone Staff
                    '839731097633423389' // Blackstone Users
        ],
    allowedCategories: ['1147909067172483162',
                        '1147909156196593787',
                        '1147909539413368883',
                        '1147909373180530708',
                        '1147909282201870406',
                        '1147909200924643349',
                        '1137072690264551604',
                        '1140190313915371530',
                        '1203928376205905960',
                        '1232728117936914432',
                        '1192106199404003379',
                        '1192108950049529906',
                        '1225165761920630845',
                        '966458661469839440',
	    		              '808109909266006087',
                        '825060923768569907',
                        '1113414355669753907',// epic wonderland play land staff
                        '1115772256052846632', /// epic wonderland staff
                        '1113414451912257536', // epic wonderland booster
                        '1115072766878691428', // epic wonderland supreme land
                        '1151855336865665024',// epic wonderland supreme land 1
                        '1320055421561471048', // epic wonderland supreme land 2
                        '1115357822222348319', // epic wonderland Epic Host Land
                        '839731102813913107', // Blackstone Squires Corner
                        '839731102281105409', // Blackstone Knights Hall
                        '839731101885923345', // Blackstone wizards tower
                        '839731101622075415', // Blackstone Dragon Cave
                        '872692223488184350', // Blackstone Nitro Islands
                        '839731101391781906', // Blackstone Kingdom Elite
                        '1019301054120210482', // Blackstone Donors
                        '967657150769942578', // Blackstone Staff
      ],
    async execute(message: Message): Promise<void> {
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

            const modRoleList: { [key: string]: string } = {
                "1135995107842195550": "1148992217202040942", // epic park staff
                '1113339391419625572':'1113407924409221120', // epic wonderland staff
                "839731097473908767": "845499229429956628", // blackstone staff royal guards
            };

            const roleId = Object.entries(modRoleList).find(([key, val]) => key === serverId)?.[1];


            if(!checkOwner){
                if(!(checkStaff.roles.cache.has(roleId))){
                    await message.reply('you must be an owner/cowner of this channel to run this command')
                        return;
                }else if(checkStaff.roles.cache.has(roleId)){
                    console.log("Clear Ran In: ", message.channel.id, "by", message.author.id)
                }
            }


       		let embed = new EmbedBuilder()
	       		.setTitle("Channel Manager: Hide/Unhide")
		    	.setDescription(`
			    *Hiding Channels removes the ability for all users to view channel except added users.*
			    *To stop messages from users not explicitly added but keep it visible, use lock *\n`)
                    	.setColor('#097969')

			const row: any = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId("channel_hide")
						.setLabel("Hide Channel")
						.setStyle(ButtonStyle.Primary)
						.setEmoji("🔐"),
					new ButtonBuilder()
						.setCustomId("channel_unhide")
						.setLabel("Unhide Channel")
						.setStyle(ButtonStyle.Primary)
						.setEmoji("🔓"),
					new ButtonBuilder()
						.setCustomId("cancel")
						.setLabel("Cancel")
						.setStyle(ButtonStyle.Danger)
						.setEmoji("✖️")
				)	
			await message.reply({embeds:[embed], components: [row] });
    }
});

