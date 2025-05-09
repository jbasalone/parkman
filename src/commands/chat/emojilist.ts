const { Message, EmbedBuilder } = require('discord.js');
import { PrefixCommand } from '../../handler';

export default new PrefixCommand({
    name: "emojis",
    aliases: ["emojilist", "allemojis"],
    // 1113339391419625572 - Epic Wonderland
    // 1135995107842195550 - Epic Park
    // 839731097473908767 - Blackstone
    // 871269916085452870 - Luminescent

    allowedGuilds: ['1135995107842195550','1113339391419625572', '839731097473908767','871269916085452870'],
    allowedRoles: ['1147864509344661644', '1148992217202040942','1147864509344661644','807811542057222176',
        '1113407924409221120', // epic wonderland staff
        '1113451646031241316', // epic wonderland users
        '1019301054120210482', // Blackstone Donors
        '967657150769942578', // Blackstone Staff
        "1130783135156670504", // Luminescent Users
        '871393325389844521', // Luminescent Leiutenint
      ],
    async execute(message: typeof Message): Promise<void> {
	try{
        async function chunkArray(array, size) {
            let chunks = [];
            for (let i = 0; i < array.length; i+= size) {
                const chunk = array.slice(i, i + size);
                chunks.push(chunk);
            }

            return chunks;
        }

        async function send (chunked) {
            var intResponse;
            await chunked.forEach(async emoji => {
                if (intResponse == 1) {
                    embed.setDescription(emoji.join(' ')).setTitle(' ');
                    await message.channel.send({ embeds: [embed] });
                } else {
                    intResponse = 1;
                    var total = cache.size;
                    var animated = cache.filter(emoji => emoji.animated).size;
                    embed
                    .setTitle(`${total - animated} Regular, ${animated} Animated, ${total} Total`)
                    .setDescription(emoji.join(' '));

                    await message.reply({ embeds: [embed] });
                }
            });
        }

        var emojis = [];
        var cache = await message.guild.emojis.fetch();

        await cache.forEach(async emoji => {
            if (emoji.animated) {
                emojis.push(`<a:${emoji.name}:${emoji.id}>`);
            } else {
                emojis.push(`<:${emoji.name}:${emoji.id}>`)
            }
        });

        var chunked = await chunkArray(emojis, 50);

        const embed = new EmbedBuilder()
        .setColor("Blurple")

        var redo;
        await chunked.forEach(async chunk => {
            redo = chunk.join(' ').length > 2000;
        });

        if (redo) {
            var newChunk = await chunkArray(emojis, 20);
            send(newChunk);
        } else {
            send(chunked);
        }

	}catch(err)
        {console.log(err)}
    },
});
