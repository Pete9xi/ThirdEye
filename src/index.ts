// ─────────────────────────────────────────────
// Imports
// ─────────────────────────────────────────────
import chalk from "chalk";
import { readFileSync } from "fs";
import { Client, GatewayIntentBits, TextChannel } from "discord.js";
import { createClient, ClientOptions } from "bedrock-protocol";
import config from "./config.js";
import { addPlayerListener } from "./player_device_listener/playerDeviceLogging.js";
//import { setupDeathListener } from "./death_listener/deathMessage.js";
import { setupChatMessageListener } from "./chat_listener/chatMessages.js";

// ─────────────────────────────────────────────
// Constants & State
// ─────────────────────────────────────────────

const { MessageContent, GuildMessages, Guilds, GuildVoiceStates } = GatewayIntentBits;
const channel: string = config.channel;
let channelId: TextChannel;
let WhitelistRead = JSON.parse(readFileSync("whitelist.json", "utf-8"));
let options;

console.log(chalk.cyan("ThirdEye v2.0.0 Starting..."));

// ─────────────────────────────────────────────
// Bedrock Client Options
// ─────────────────────────────────────────────

if (config.isRealm) {
    //Handel the realm config here!
    console.log(chalk.yellow("Connecting to a realm"));
    options = {
        profilesFolder: "authentication_tokens",
        realms: {
            realmInvite: config.realmInviteCode,
        },
    } as ClientOptions;
} else {
    console.log(chalk.yellow("Connecting to a server"));
    options = {
        host: config.ip,
        port: config.port,
        username: config.username,
        offline: config.AuthType,
        profilesFolder: "authentication_tokens",
    } as ClientOptions;
}

// ─────────────────────────────────────────────
// Join Minecraft Server
// ─────────────────────────────────────────────

const bot = createClient(options);

// ─────────────────────────────────────────────
// Discord Client Setup
// ─────────────────────────────────────────────

const client = new Client({
    intents: [Guilds, GuildMessages, MessageContent, GuildVoiceStates],
});

/**
 * Logs the client into Discord.
 * In a sharded setup, this file must be launched
 * by the ShardingManager — never directly with `node bot.js`.
 */

client.login(config.token);

// ─────────────────────────────────────────────
// Discord Events
// ─────────────────────────────────────────────
client.once("clientReady", () => {
    const shardId = client.shard?.ids[0] ?? 0;
    console.log(chalk.green(`ThirdEye logged in as ${client.user.tag} | Shard ${shardId}`));
    const channelObj = client.channels.cache.get(channel);
    if (channelObj) {
        channelId = channelObj as TextChannel;
        // Call function if channel exists
        setupChatMessageListener(bot, channelId);
        //setupDeathListener(bot, channelId);
        addPlayerListener(bot, channelId, WhitelistRead);
    } else {
        console.log(chalk.red(`I could not find the in-game channel in Discord. 1`));
    }
});

export function runCMD(cmd: string) {
    bot.queue("command_request", {
        command: cmd,
        origin: {
            type: "player",
            uuid: "",
            request_id: "",
            player_entity_id: [0, 0],
        },
        internal: false,
        version: "latest",
    });
}
