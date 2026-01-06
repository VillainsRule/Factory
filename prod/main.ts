import Bun from 'bun';
import fs from 'fs';
import path from 'path';

import { ActivityType, Client, Events, GatewayIntentBits, MessageFlags, Partials } from 'discord.js';

import type { Command } from './types';

const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping
    ],
    partials: [
        Partials.Channel
    ]
});

const dataDir = path.join(import.meta.dirname, '..', 'data');
const accData = path.join(dataDir, 'acc.txt');
const usdData = path.join(dataDir, 'usd.txt');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(accData)) fs.writeFileSync(accData, '');
if (!fs.existsSync(usdData)) fs.writeFileSync(usdData, '');

const commandList = fs.readdirSync(path.join(import.meta.dirname, 'commands'));
const commands: Record<string, Command> = {};

for (let file of commandList) {
    if (!file.endsWith('.ts')) continue;

    let commandImport = await import(`./commands/${file}`);
    commands[file.replace('.ts', '')] = commandImport.default;
}

client.on(Events.ClientReady, () => {
    if (!client.user) throw new Error('client user is null');

    const numAccounts = fs.readFileSync(accData, 'utf8').split('\n').filter(a => a).length;
    const numUsed = fs.readFileSync(usdData, 'utf8').split('\n').filter(a => a).length;

    const setPres = () => client.user && client.user.setPresence({
        activities: [{
            name: `${numAccounts} accounts | ${numUsed} used`,
            type: ActivityType.Custom
        }],
        status: 'dnd'
    });

    setPres();
    setInterval(setPres, 5 * 60 * 1000);

    console.log(`logged in as ${client.user.tag}!`);

    client.application?.commands.set(Object.values(commands).map(cmd => cmd.data.toJSON()))
        .then(() => console.log('slash commands updated'));
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commands[interaction.commandName];
    if (command) command.execute(interaction);
    else interaction.reply({ content: 'command not found', flags: [MessageFlags.Ephemeral] });
});

client.login(Bun.env.DISCORD_TOKEN);

import './server.ts';

console.log('server running on port 2074');