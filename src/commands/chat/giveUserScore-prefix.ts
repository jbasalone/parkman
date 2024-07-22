import { CommandInteraction, EmbedBuilder, Interaction, Message, MessageReaction, ButtonBuilder, ButtonStyle } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";
const { getpoints, getTop3, addNewscore } = require('/home/ubuntu/ep_bot/extras/functions'); 
const { amarikey } = require('/home/ubuntu/ep_bot/extras/settings')
const { AmariBot } = require("amaribot.js");
const amariclient = new AmariBot(amarikey);

export = {
    name: "score",
    aliases: ["Scores", "myscore", "ms",],
    type: CommandTypes.PrefixCommand,
    roleWhitelist: ['1147864509344661644', '1148992217202040942','1246691890183540777','1143236724718317673'],
    cooldown: 10,
    async execute(message: Message): Promise<void> {
	try{
		if (message.author.bot) return;
			// get user id
		let uid;
		userName = message.mentions.users.first()
		if(userName){
			uid = message.mentions.users.first().id
		}else if(!(userName)) {
			uid = message.author.id
		}

			// get score values

            	let check_score = await getpoints(uid)
            	let myamari = await amariclient.getUserLevel(message.guild.id, uid)
            	let myamari_rewards = await amariclient.getLeaderboardPosition(message.guild.id, uid)
            	let myamari_nextlvl = await amariclient.getNextLevelExp(`${myamari.level}`)
            	let top3_scores = await getTop3()
            	let score_list = " "
			// if no score exists, add an entry to the db
            	if (!check_score) {
                 	   await addNewscore(message.author.id, 0, 0, 0, 0, 1, 0)
                }
			// get top three scores 
            	for(let i=0; i < top3_scores.length; i++) {
                	score_list  = await score_list.concat(`\n> ${i+1}. <@!${top3_scores[i].user}> ${top3_scores[i].level}`)
            	}
			// get info and build embed
            	let score = await getpoints(uid)
            	let new_points = String(score[0].points)
            	let embed = new EmbedBuilder()
                	.setFooter({text:message.author.tag, iconURL:message.author.displayAvatarURL()}).setTimestamp().setColor('#097969')
                	.setTitle(`Epic Park Scoreboard`)
                	.setDescription(`<@!${uid}>\n
                                 **Top 3 Players Pts:** ${score_list}`
                                 )
                	.addFields({name: '```Current Received Points```', value: " ", inline: false},
                        	{ name: 'Love <:ep_love:1193499415013494844> ', value: score[0].loves, inline: true },
                        	{ name: 'Hugs <a:ep_bearhug:1231806904930402417> ', value: score[0].hugs, inline: true  },
                        	{ name: 'Thanks <:ep_thankyou:1231803987603357817> ', value: score[0].thanks, inline: true },
                        	{ name: 'Bonks <a:ep_pepebonkk:1150840294938525696> ', value: score[0].bonks, inline:true },
                        	{ name: 'Total Points', value: `${new_points}` , inline:true },
                        	{ name: '\u200B', value: ' ' },
                        	{ name: '```Amari Information ```', value: ' ', inline: false},
                        	{ name: 'Amari Level', value: `${myamari.level}`, inline: true},
                        	{ name: 'Amari Exp', value: `${myamari.exp}`, inline: true},
                        	{ name: 'Amari LeaderBoard Position', value:`${myamari_rewards}`, inline: true},
                        	{ name: 'Amari Pts. to Next Level', value:`${myamari_nextlvl}`, inline: true})
               await message.reply({embeds:[embed]})


	
	}catch(err) {
        	console.log(err)}

	}
} as PrefixCommandModule;

