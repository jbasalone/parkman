import {ChannelType} from "discord.js/typings";

const { getUserCoins } = require('/home/ubuntu/ep_bot/extras/functions');
import { PrefixCommand } from "../../../handler";
import { Message } from 'discord.js';

export default new PrefixCommand({
    name: "give coins",
    aliases: ["give c", "g c"],
    allowedGuilds: ['1135995107842195550'],
    allowedRoles: ['1147864509344661644', '1148992217202040942', '1147864509344661644'],
    allowedCategories: [
        '1147909067172483162',
        '1147909156196593787',
        '1147909539413368883',
        '1147909373180530708',
        '1147909282201870406',
        '1147909200924643349',
        '1140190313915371530',
        '1320055421561471048', // Epic Wonderland Supreme Land 2
        '1137072690264551604', // epic park staff area
        '1128607975972548711', // Luminescent Staff

    ],
    async execute(message: Message): Promise<void> {
        if(message.channel.type !== ChannelType.GuildText) return;
        const channel = message.channel.id;
        const serverId = message.guild.id;
        //Will this get the args removing the name of the command.
        //It will remove the give c?
        const commandBody = message.content.trim().replace(this.name,'').replace(this.aliases[0],'').replace(this.aliases[1],'')
        const args = commandBody.split(/\s+/).slice(2);

        //TODO can we have a role for economy manager?
        const modRoleList: { [key: string]: string } = {
            "1135995107842195550": "1148992217202040942", // epic park staff
            '1113339391419625572':'1113407924409221120', // epic wonderland staff
            "839731097473908767": "845499229429956628", // blackstone staff royal guards
            "871269916085452870": "871393325389844521", // Luminescent Staff
        };
        //Get user staff
        let checkUserStaff = await  message.guild.members.cache.get(message.author.id)
        const managersRole = Object.entries(modRoleList).find(([key, val]) => key === serverId)?.[1];

        if(!(checkUserStaff.roles.cache.has(managersRole))) {
            await message.reply('You must have the permission to manage economy on this server')
            return;
        }

        if(args.length ===0){
            await message.reply("you need to mention a @user and the amount of coins")
            return;
        }

        let userId;
        if(message.mentions.users.map(m => m).length) {
            userId = message.mentions.users.first().id;
        }else{
            await message.reply("please specify a user");
            return;
        }
        if (userId === message.author.id) {
            await message.reply('You can give coins to yourself, just not this way');
            return;
        }
        let coins = 0;
        try{
            coins = Number(args[1]);
        }catch (e) {
            await message.reply('The amount of coins needs to be a number');
            return
        }

        let currentCoins = await getUserCoins(userId);
        currentCoins = currentCoins + coins
        //TODO need a addCoinsUser(userId,coins)
        await message.reply(`${coins} coins has been given to <@${userId}`);

    }
});