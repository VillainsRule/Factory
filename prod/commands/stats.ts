import fs from 'node:fs';
import path from 'node:path';

import { ComponentType, InteractionContextType, MessageFlags, SeparatorSpacingSize, SlashCommandBuilder } from 'discord.js';

import type { Command } from '../types';

const accPath = path.join(import.meta.dirname, '..', '..', 'data', 'acc.txt');
const usedPath = path.join(import.meta.dirname, '..', '..', 'data', 'usd.txt');

export default {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('display Factory statistics')
        .setContexts([InteractionContextType.BotDM, InteractionContextType.PrivateChannel, InteractionContextType.Guild]),

    execute: async (interaction) => {
        const accounts = fs.readFileSync(accPath, 'utf8').split('\n').filter((a) => a).length;
        const used = fs.readFileSync(usedPath, 'utf8').split('\n').filter((a) => a).length;

        interaction.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [{
                type: ComponentType.Container,
                components: [
                    { type: ComponentType.TextDisplay, content: '### factory $ statistics' },
                    { type: ComponentType.Separator, spacing: SeparatorSpacingSize.Small },
                    { type: ComponentType.TextDisplay, content: `stock: **${accounts.toLocaleString()}**` },
                    { type: ComponentType.TextDisplay, content: `used: **${used.toLocaleString()}**` },
                    { type: ComponentType.TextDisplay, content: `total: **${(accounts + used).toLocaleString()}**` }
                ]
            }]
        });
    }
} as Command;