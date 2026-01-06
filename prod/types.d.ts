import { ChatInputCommandInteraction, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';

declare module 'bun' {
    interface Env {
        SOCKS_PROXY: string;
        DISCORD_TOKEN: string;

        ALLOWED_USERS: string;

        ERROR_INVALID_KEY: string;
        ERROR_NO_ACCOUNTS: string;
    }
}

export interface Command {
    data: SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface Key {
    user: string;
    token: string;
}