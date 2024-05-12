// @ts-nocheck
import { Message, MessageManager, MessageCollector } from "discord.js";
import { CommandTypes, PrefixCommandModule } from "../../handler/types/Command";

export = {
    name: "unpin",
    aliases: ["Unpin", "removepin"],
    type: CommandTypes.PrefixCommand,
    channelWhitelist:["1147233774938107966"],
    ownerOnly: true,
    async execute(message: Message): Promise<void> {
	    if(!message.reference){
		    await message.reply("reply to the message you want pinned")
	    }
	    // channel.messages.fetchedPinned()
	    let repliedTo = await message.fetchReference(message.reference.messageId)
            if(!repliedTo.pinned){
		    await message.reply("Message is not pinned")
	    }else{
		    repliedTo.unpin()
        	    message.reply("Your Message pin is removed")
    		}
    }
    
} as PrefixCommandModule;
