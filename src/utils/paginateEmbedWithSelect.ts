import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  EmbedBuilder,
  Message,
  ComponentType,
} from 'discord.js';

const activePaginations = new Map<
  string,
  {
    updatePage: (delta: number) => Promise<void>;
    jumpTo: (index: number) => Promise<void>;
  }
>();

async function paginateEmbedWithSelect(
  message: Message,
  pages: EmbedBuilder[],
  timeout = 60000,
  labels?: string[]
) {
  if (!pages || pages.length === 0) {
    return message.reply('❌ No pages to display.');

  }

  let currentPage = 0;
  const sessionId = 'localpg';

  const embedWithFooter = (index: number) =>
    pages[index].setFooter({ text: `Page ${index + 1} of ${pages.length}` }).setTimestamp();

  const createRows = () => {
    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`${sessionId}_b`).setLabel('◀️').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`${sessionId}_s`).setLabel('⏺️').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId(`${sessionId}_f`).setLabel('▶️').setStyle(ButtonStyle.Secondary)
    );

    const select = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`${sessionId}_jump`)
        .setPlaceholder('Jump to page...')
        .addOptions(
          pages.map((_, i) => ({
            label: labels?.[i] ?? `Page ${i + 1}`,
            value: `${i}`,
          }))
        )
    );

    return [buttons, select];
  };

  const messageReply = await message.reply({
    embeds: [embedWithFooter(currentPage)],
    components: createRows(),
  });

  activePaginations.set(sessionId, {
    updatePage: async (delta: number) => {
      currentPage = (currentPage + delta + pages.length) % pages.length;
      await messageReply.edit({
        embeds: [embedWithFooter(currentPage)],
        components: createRows(),
      });
    },
    jumpTo: async (index: number) => {
      currentPage = index;
      await messageReply.edit({
        embeds: [embedWithFooter(currentPage)],
        components: createRows(),
      });
    },
  });

  const collector = messageReply.createMessageComponentCollector({
    time: timeout,
    componentType: ComponentType.Button,
    filter: (i) => i.user.id === message.author.id && i.customId.startsWith(`${sessionId}_`),
  });

  const selectCollector = messageReply.createMessageComponentCollector({
    time: timeout,
    componentType: ComponentType.StringSelect,
    filter: (i) => i.user.id === message.author.id && i.customId === `${sessionId}_jump`,
  });

  collector.on('collect', async (interaction) => {
    try {
      if (interaction.customId === `${sessionId}_b`) {
        currentPage = currentPage > 0 ? currentPage - 1 : pages.length - 1;
      } else if (interaction.customId === `${sessionId}_f`) {
        currentPage = (currentPage + 1) % pages.length;
      } else if (interaction.customId === `${sessionId}_s`) {
        await interaction.update({ components: [], content: '⏹️ Pagination ended.' });
        collector.stop();
        selectCollector.stop();
        return;
      }

      await interaction.update({
        embeds: [embedWithFooter(currentPage)],
        components: createRows(),
      });
    } catch (err: any) {
      if (err.code !== 10062) console.error('❌ Pagination button error:', err);
    }
  });

  selectCollector.on('collect', async (interaction) => {
    try {
      const selected = parseInt(interaction.values[0]);
      currentPage = selected;

      await interaction.update({
        embeds: [embedWithFooter(currentPage)],
        components: createRows(),
      });
    } catch (err: any) {
      if (err.code !== 10062) console.error('❌ Pagination select error:', err);
    }
  });

  const endHandler = async () => {
    if (messageReply.editable) {
      const disabledButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId(`${sessionId}_b`).setLabel('◀️').setStyle(ButtonStyle.Secondary).setDisabled(true),
        new ButtonBuilder().setCustomId(`${sessionId}_s`).setLabel('⏺️').setStyle(ButtonStyle.Danger).setDisabled(true),
        new ButtonBuilder().setCustomId(`${sessionId}_f`).setLabel('▶️').setStyle(ButtonStyle.Secondary).setDisabled(true)
      );

      await messageReply.edit({
        content: '⏳ Tool Expired',
        components: [disabledButtons],
      });
    }
  };

  collector.on('end', endHandler);
  selectCollector.on('end', endHandler);
}

function getPaginationSession(sessionId: string) {
  return activePaginations.get(sessionId);
}

export { paginateEmbedWithSelect, getPaginationSession };