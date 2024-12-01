import { PaginatorButtonType, type PaginatorSendOptions, type PaginatorSettings } from '../types/Paginator';
import {
  ActionRowBuilder,
  AutocompleteInteraction,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  type EmbedBuilder,
  Message,
  MessageComponentInteraction,
  type MessagePayloadOption,
} from 'discord.js';

export class EmbedPaginator {
  private readonly settings: PaginatorSettings;
  private currentPageIndex: number;
  private readonly maxPageIndex: number;

  constructor(settings: PaginatorSettings) {
    this.settings = settings;
    this.currentPageIndex = 0;
    this.maxPageIndex = settings.pages.length;
    this.settings.restrictToAuthor = settings.restrictToAuthor ?? true;
  }

  async send(options: PaginatorSendOptions): Promise<void> {
    const { context, ephemeral, followUp, content } = options;
    if (context instanceof AutocompleteInteraction) return;

    const isInteraction: boolean =
      context instanceof CommandInteraction || context instanceof MessageComponentInteraction;

    let messageOptions: MessagePayloadOption = {
      content,
      ephemeral: ephemeral ?? false,
      embeds: [this.getPageEmbed()],
      components: [this.createButtonRow()],
      fetchReply: true,
    };

    if (!messageOptions.content) delete messageOptions.content;
    if (!messageOptions.embeds) delete messageOptions.embeds;

    let sentMessage: Message;

    if (isInteraction) {
      const interaction = context as CommandInteraction | MessageComponentInteraction;
      const sendMethod = followUp ? 'followUp' : 'reply';
      sentMessage = (await interaction[sendMethod](messageOptions)) as Message;
    } else {
      const message = context as Message;
      sentMessage = await message.reply({
        content: messageOptions.content,
        embeds: messageOptions.embeds,
        components: messageOptions.components,
      });
    }

    await this.collectButtonInteractions(sentMessage);
  }

  private getPageEmbed(): EmbedBuilder {
    const embed: EmbedBuilder = this.settings.pages[this.currentPageIndex];

    if (this.settings.autoPageDisplay) {
      embed.setFooter({ text: `Page ${this.currentPageIndex + 1}/${this.maxPageIndex}` });
    }

    return embed;
  }

  private createButtonRow(): ActionRowBuilder<ButtonBuilder> {
    const row: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>();

    const defaultButtons = {
      [PaginatorButtonType.First]: { customId: 'paginator:first', style: ButtonStyle.Primary, emoji: '⏮' },
      [PaginatorButtonType.Previous]: { customId: 'paginator:previous', style: ButtonStyle.Primary, emoji: '◀' },
      [PaginatorButtonType.Next]: { customId: 'paginator:next', style: ButtonStyle.Primary, emoji: '▶' },
      [PaginatorButtonType.Last]: { customId: 'paginator:last', style: ButtonStyle.Primary, emoji: '⏭' },
    };

    const isFirstPage: boolean = this.currentPageIndex === 0;
    const isLastPage: boolean = this.currentPageIndex === this.maxPageIndex - 1;

    Object.entries(defaultButtons).forEach(([type, config]): void => {
      const customConfig = this.settings.buttons?.find((btn) => btn.type === +type) || null;
      const button: ButtonBuilder = new ButtonBuilder()
        .setCustomId(config.customId)
        .setStyle(customConfig?.style ?? config.style)
        .setEmoji(customConfig?.emoji ?? config.emoji)
        .setDisabled(
          !this.settings.loopPages &&
            (((+type === PaginatorButtonType.First || +type === PaginatorButtonType.Previous) && isFirstPage) ||
              ((+type === PaginatorButtonType.Next || +type === PaginatorButtonType.Last) && isLastPage)),
        );

      if (customConfig?.label) {
        button.setLabel(customConfig.label);
      }

      if (
        !this.settings.hideFirstLastButtons ||
        (+type !== PaginatorButtonType.First && +type !== PaginatorButtonType.Last)
      ) {
        row.addComponents(button);
      }
    });

    return row;
  }

  private async collectButtonInteractions(message: Message): Promise<void> {
    const authorId: string = message.author.id;

    const filter = (interaction: MessageComponentInteraction): boolean =>
      interaction.isButton() &&
      interaction.message.id === message.id &&
      (!this.settings.restrictToAuthor || interaction.user.id !== authorId);

    const collector = message.createMessageComponentCollector({
      filter,
      time: this.settings.timeout * 1000,
    });

    collector.on('collect', async (interaction: MessageComponentInteraction): Promise<void> => {
      try {
        await interaction.deferUpdate();

        switch (interaction.customId) {
          case 'paginator:first':
            this.currentPageIndex = 0;
            break;
          case 'paginator:previous':
            this.currentPageIndex = Math.max(0, this.currentPageIndex - 1);
            break;
          case 'paginator:next':
            this.currentPageIndex = Math.min(this.maxPageIndex - 1, this.currentPageIndex + 1);
            break;
          case 'paginator:last':
            this.currentPageIndex = this.maxPageIndex - 1;
            break;
        }

        await interaction.editReply({
          embeds: [this.getPageEmbed()],
          components: [this.createButtonRow()],
        });
      } catch (error) {
        console.error('Error handling interaction:', error);
      }
    });

    collector.on('end', async (): Promise<void> => {
      try {
        if (!this.settings.showButtonsAfterTimeout) {
          await message.edit({
            components: [],
          });
        }
      } catch (error) {
        console.error('Error ending collector:', error);
      }
    });
  }
}
