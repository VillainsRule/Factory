import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { ComponentType, InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';

import type { Command, Key } from '../types';

const keyPath = path.join(import.meta.dirname, '..', '..', 'data', 'key.json');
if (!fs.existsSync(keyPath)) fs.writeFileSync(keyPath, '[]');

export default {
    data: new SlashCommandBuilder()
        .setName('key')
        .setDescription('manage API keys')
        .setContexts([InteractionContextType.BotDM, InteractionContextType.PrivateChannel, InteractionContextType.Guild])
        .addSubcommand(subcommand =>
            subcommand
                .setName('generate')
                .setDescription('generate an API key')
                .addStringOption(option =>
                    option.setName('user')
                        .setDescription('the user of the key')
                        .setRequired(true)))

        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('list all API key users'))

        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('remove an API key')
                .addStringOption(option =>
                    option.setName('user')
                        .setDescription('the user to remove')
                        .setRequired(true)))

        .addSubcommand(subcommand =>
            subcommand
                .setName('mine')
                .setDescription('get your API key')),

    execute: async (interaction) => {
        const keys = JSON.parse(fs.readFileSync(keyPath, 'utf8')) as Key[];

        if (interaction.options.getSubcommand() === 'mine') {
            const key = keys.find(k => k.user === `<@${interaction.user.id}>`);
            if (!key) return interaction.reply({ content: 'you have no key. ask an admin for one.' });

            return interaction.reply({
                content: `**your API key:**\n\`\`\`${key.token}\n\`\`\``,
                flags: MessageFlags.Ephemeral
            });
        }

        const admins = Bun.env.ALLOWED_USERS?.split(',').map(id => id.trim()) || [];
        if (!admins.includes(interaction.user.id)) return interaction.reply({ content: ':giggle: no.' });

        if (interaction.options.getSubcommand() === 'generate') {
            const user = interaction.options.getString('user', true).trim();
            if (keys.some(k => k.user === user)) return interaction.reply({ content: 'that user has a key.' });

            const bytes = crypto.randomBytes(69).toString('hex');

            keys.push({ user: user!, token: bytes });
            fs.writeFileSync(keyPath, JSON.stringify(keys, null, 4));

            interaction.reply({
                content: `**created key for ${user}**\n\`\`\`${bytes}\n\`\`\``,
                flags: MessageFlags.Ephemeral
            });
        }

        if (interaction.options.getSubcommand() === 'list') interaction.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [{
                type: ComponentType.Container,
                components: [
                    { type: ComponentType.TextDisplay, content: '### factory $ users' },
                    {
                        type: ComponentType.TextDisplay, content: keys.length ?
                            keys.map(k => `- ${k.user}`).join('\n') :
                            '**no users found.**'
                    }
                ]
            }]
        });

        if (interaction.options.getSubcommand() === 'remove') {
            const user = interaction.options.getString('user', true).toLowerCase().trim();
            if (!keys.some(k => k.user.toLowerCase() === user)) return interaction.reply({ content: 'that user has no key.' });

            keys.splice(keys.findIndex(k => k.user.toLowerCase() === user), 1);
            fs.writeFileSync(keyPath, JSON.stringify(keys, null, 4));

            interaction.reply(`**deleted key belonging to ${user}!**`);
        }
    }
} as Command;