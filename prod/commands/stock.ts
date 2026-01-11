import fs from 'node:fs';
import path from 'node:path';

import { ComponentType, InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';

import type { Command } from '../types';

const accPath = path.join(import.meta.dirname, '..', '..', 'data', 'acc.txt');
const usedPath = path.join(import.meta.dirname, '..', '..', 'data', 'usd.txt');

export default {
    data: new SlashCommandBuilder()
        .setName('stock')
        .setDescription('display the stock of this Factory instance')
        .setContexts([InteractionContextType.BotDM, InteractionContextType.PrivateChannel, InteractionContextType.Guild]),

    execute: async (interaction) => {
        const accounts = fs.readFileSync(accPath, 'utf8').split('\n').filter((a) => a).length;
        const used = fs.readFileSync(usedPath, 'utf8').split('\n').filter((a) => a).length;

        interaction.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [{
                type: ComponentType.Container,
                components: [
                    {
                        type: ComponentType.Section,
                        components: [
                            { type: ComponentType.TextDisplay, content: '## factory $ account stock' },
                            { type: ComponentType.TextDisplay, content: `### available: **${accounts.toLocaleString()}**` },
                            { type: ComponentType.TextDisplay, content: `### used overtime: **${used.toLocaleString()}**` }
                        ],
                        accessory: {
                            type: ComponentType.Thumbnail,
                            media: { url: 'https://files.catbox.moe/adgmf7.png' }
                        }
                    }
                ]
            }]
        });
    }
} as Command;