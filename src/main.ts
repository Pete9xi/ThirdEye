import { readFileSync, writeFileSync } from "fs";
import { Client, GatewayIntentBits, EmbedBuilder, TextBasedChannel, Guild } from "discord.js";
import { createClient, ClientOptions } from "bedrock-protocol";
import config from "./config.js";
import { setupDeathListener } from "./death_listener/deathMessage.js";
import { addPlayerListener } from "./player_device_listener/playerDeviceLogging.js";
import { setupSystemCommandsListener } from "./system_commands_listener/systemCommandsLogging.js";
import { setupVoiceChatListener } from "./voiceChat_listener/voiceChat.js";
import { checkAndDeleteEmptyChannels } from "./voiceChat_listener/voiceChatCleanUp.js";
import { setupAntiCheatListener } from "./anticheat_listener/anticheat_logs.js";
import { idList } from "./badActors.js";

const { MessageContent, GuildMessages, Guilds } = GatewayIntentBits;
const channel: string = config.channel;
let channelId: TextBasedChannel;
const token = config.token;
const anticheatChannel: string = config.antiCheatLogsChannel;
let anticheatChannelId: TextBasedChannel;
const systemCommandsChannel: string = config.systemCommandsChannel;
let systemCommandsChannelId: TextBasedChannel;
const anticheatLogs = config.antiCheatEnabled;
const cmdPrefix = config.cmdPrefix;
const logSystemCommands = config.logSystemCommands;
let clientPermissionLevel: string = "";
let clientGamemode: string = "";
let clientEntityID: BigInt;
export const correction = {
    "§r§4[§6Paradox§4]§r": "Paradox",
    "§4[§6Paradox§4]": "Paradox",
    "§l§6[§4Paradox§6]§r": "Paradox",
    "§4P": "P",
    "§l": "",
    "§r": "",
    "§a": "",
    "§b": "",
    "§c": "",
    "§d": "",
    "§f": "",
    "§9": "",
    "§8": "",
    "§7": "",
    "§6": "",
    "§5": "",
    "§4": "",
    "§3": "",
    "§2": "",
    "§1": "",
    "§0": "",
    "§o": "",
    "§k": "",
    "§¶": "",
    "§r§6[§aScythe§6]§r": "",
    "§f§4[§6Paradox§4]§f": "Paradox",
    "\\n§l§o§6[§4Paradox AntiCheat Command Help§6]§r§o\\n": "Paradox AntiCheat Command Help",
};

let WhitelistRead = JSON.parse(readFileSync("whitelist.json", "utf-8"));

// create new discord client that can see what servers the bot is in, as well as the messages in those servers
const client = new Client({ intents: [Guilds, GuildMessages, MessageContent, "GuildVoiceStates"] });
client.login(token);

let options;
console.log("ThirdEye v1.0.10");
// bot options
if (config.isRealm) {
    //Handel the realm config here!
    console.log("Connecting to a realm");
    options = {
        profilesFolder: "authentication_tokens",
        realms: {
            realmInvite: config.realmInviteCode,
        },
    } as ClientOptions;
} else {
    console.log("Connecting to a server");
    options = {
        host: config.ip,
        port: config.port,
        username: config.username,
        offline: config.AuthType,
        profilesFolder: "authentication_tokens",
    } as ClientOptions;
}
// join server
const bot = createClient(options);

bot.on("spawn", () => {
    console.log(`Bedrock bot logged in as ${config.username}`);
    if (config.useEmbed === true) {
        const msgEmbed = new EmbedBuilder()
            .setColor(config.setColor)
            .setTitle(config.setTitle)
            .setDescription("[ThirdEye]:" + " Client is logged in.")
            .setAuthor({ name: "‎", iconURL: config.logoURL });

        if (typeof anticheatChannelId === "object") {
            return anticheatChannelId.send({ embeds: [msgEmbed] });
        } else {
            return console.log("I could not find the paradoxLogs channel in Discord. 1");
        }
    } else {
        if (typeof anticheatChannelId === "object") {
            return anticheatChannelId.send("[ThirdEye]: Client is logged in.");
        } else {
            return console.log("I could not find the paradoxLogs channel in Discord. 2");
        }
    }
});
/**when this packet is sent it contains the clients entityID which will be used to verify if the bot has op status
 *and has been able to enter into creative mode
 */
bot.on("start_game", (packet: StartGame) => {
    clientPermissionLevel = packet.permission_level.toString();
    clientGamemode = packet.player_gamemode.toString();
});
//bot
// when discord client is ready, send login message
client.once("ready", (c) => {
    console.log(`Discord bot logged in as ${c.user.tag}`);
    const channelObj = client.channels.cache.get(channel);
    if (channelObj) {
        channelId = channelObj as TextBasedChannel;
        // Call function if channel exists
        setupDeathListener(bot, channelId);
        addPlayerListener(bot, channelId, WhitelistRead);
    } else {
        console.log(`I could not find the in-game channel in Discord. 1`);
    }

    if (anticheatLogs === true) {
        const anticheatChannelObj = client.channels.cache.get(anticheatChannel);
        if (anticheatChannelObj) {
            anticheatChannelId = anticheatChannelObj as TextBasedChannel;
            setupAntiCheatListener(bot, anticheatChannelId);
        } else {
            console.log(`I could not find the paradoxLogs Channel in Discord. 3`);
        }
    }

    if (logSystemCommands === true) {
        const systemChannelObj = client.channels.cache.get(systemCommandsChannel);
        if (systemChannelObj) {
            systemCommandsChannelId = systemChannelObj as TextBasedChannel;
            setupSystemCommandsListener(bot, systemCommandsChannelId);
        } else {
            console.log(`I could not find the systemLogs Channel in Discord. 3`);
        }
    }

    if (!channel) {
        console.log(`I could not find the in game channel in Discord. Not Ready?`);
    }
    if (!anticheatChannel) {
        console.log(`I could not find the paradoxLogs Channel in Discord. Not Ready?`);
    }
    //pass guild
    const guild = client.guilds.cache.get(config.guild);
    if (guild) {
        console.log(`Found guild: ${guild.name}`);
    } else {
        console.error(`Guild with ID ${config.guild} not found.`);
    }
    //Voice command listener
    setupVoiceChatListener(bot, guild as Guild);
});

client.on("messageCreate", (message) => {
    if (message.author.bot === true) {
        /**This check will prevent a loop back message.
         * If the incoming message is from a bot it will ignore it.
         */
    } else {
        //get the list if admins
        const admins = config.admins;
        if (message.content.startsWith(cmdPrefix) && !message.content.startsWith(cmdPrefix + "/") && admins.includes(message.author.id) && anticheatChannel && message.channel.id === anticheatChannelId.id) {
            console.log("command received: " + message.content + " From: " + message.author.id);
            bot.queue("text", {
                type: "chat",
                needs_translation: false,
                source_name: config.username,
                xuid: "",
                platform_chat_id: "",
                message: `${message.content}`,
                filtered_message: "",
            });
            return;
        }
        //Check to see if the user is running a minecraft slash command
        if (message.content.startsWith(cmdPrefix + "/") && admins.includes(message.author.id) && anticheatChannel && message.channel.id === anticheatChannelId.id) {
            console.log("command received: " + message.content + " From: " + message.author.id);
            //remove the prefix data and create the command
            let cmd = message.content.slice(2);
            bot.queue("command_request", {
                command: cmd,
                origin: {
                    type: "player",
                    uuid: "",
                    request_id: "",
                },
                internal: false,
                version: 52,
            });

            return;
        }

        if (message.content.startsWith("$") && admins.includes(message.author.id) && anticheatChannel && message.channel.id === anticheatChannelId.id && !message.content.endsWith("-r") && !message.content.includes("$reboot")) {
            //add the user to the whitelist.
            const msg = message.content.replace("$", "");
            WhitelistRead.whitelist.push(msg);
            writeFileSync("whitelist.json", JSON.stringify(WhitelistRead, null, 2), "utf-8");
            console.log("Data has been written to the file successfully.");
            WhitelistRead = JSON.parse(readFileSync("whitelist.json", "utf-8"));
            console.log("Reloaded contents:", WhitelistRead.whitelist);
            return;
        }
        if (message.content.startsWith("$") && admins.includes(message.author.id) && anticheatChannel && message.channel.id === anticheatChannelId.id && message.content.endsWith("-r") && !message.content.includes("$reboot")) {
            // remove the user from the whitelist.
            const msg = message.content.replace("$", "");
            const msgdel = msg.replace("-r", "");
            console.log("Removing: " + msgdel + "from the whitelist.");
            WhitelistRead.whitelist = WhitelistRead.whitelist.filter((name: string) => name !== msgdel);
            writeFileSync("whitelist.json", JSON.stringify(WhitelistRead, null, 2), "utf-8");
            console.log("Data has been written to the file successfully.");
            WhitelistRead = JSON.parse(readFileSync("whitelist.json", "utf-8"));
            console.log("Reloaded contents:", WhitelistRead.whitelist);
            return;
        }
        if (message.content === "$reboot" && admins.includes(message.author.id) && anticheatChannel && message.channel.id === anticheatChannelId.id) {
            console.log("Forcing a re connect.");
            process.exit(); // Exit the script
        }
        if (channel && message.channel.id === channelId.id) {
            let cmd;
            //Check to make sure the Discord User is not on the know bad actors ID list.
            if (idList.includes(message.author.id)) {
                //We will then send a command to the server to trigger the message sent in discord.
                cmd = `/tellraw @a {"rawtext":[{"text":"§8[§9Discord§8] §4${message.author.username} (Known Hacker/Troll) : §f${message.content}"}]}`;
                //If configured Log the message to anticheat channel.
                if (config.logBadActors === true) {
                    const msgEmbed = new EmbedBuilder()
                        .setColor(config.setColor)
                        .setTitle(config.setTitle)
                        .setDescription("Message sent to the bot from Discord from Author: " + message.author.username + " Content: " + message.content + " Unique ID: " + message.author.id)
                        .setAuthor({ name: "‎", iconURL: config.logoURL })
                        .setThumbnail("https://static.wikia.nocookie.net/minecraft_gamepedia/images/7/76/Impulse_Command_Block.gif/revision/latest?cb=20191017044126");
                    anticheatChannelId.send({ embeds: [msgEmbed] });
                }
            } else {
                //We will then send a command to the server to trigger the message sent in discord.
                cmd = `/tellraw @a {"rawtext":[{"text":"§8[§9Discord§8] §7${message.author.username}: §f${message.content}"}]}`;
            }

            bot.queue("command_request", {
                command: cmd,
                origin: {
                    type: "player",
                    uuid: "",
                    request_id: "",
                },
                internal: false,
                version: 52,
            });
        }
    }
});
client.on("voiceStateUpdate", (newState) => {
    checkAndDeleteEmptyChannels(newState.guild);
});

bot.on("close", () => {
    console.log("The server has closed the connection.");
});
bot.on("login", () => {
    console.log("Client has been authenticated by the server.");
});
bot.on("join", () => {
    console.log("The client is ready to receive game packets.");
});
bot.on("close", () => {
    console.log("Client disconnected:", bot.entityId);
    let remainingTime = 2 * 60; // 2 minutes in seconds, allowing for slower servers to reboot in time ready for a new connection
    if (config.useEmbed === true) {
        const msgEmbed = new EmbedBuilder()
            .setColor(config.setColor)
            .setTitle(config.setTitle)
            .setDescription("[ThirdEye]:" + " The client has lost connection to the server and will initiate a reboot in: " + remainingTime + " Seconds")
            .setAuthor({ name: "‎", iconURL: config.logoURL });
        if (typeof anticheatChannelId === "object") {
            anticheatChannelId.send({ embeds: [msgEmbed] });
        } else {
            return console.log("I could not find the paradoxLogs channel in Discord. 4");
        }
    } else {
        if (typeof anticheatChannelId === "object") {
            anticheatChannelId.send(`[ThirdEye]: The client has lost connection to the server and will initiate a reboot in: **${remainingTime} ** Seconds`);
        } else {
            console.log("I could not find the paradoxLogs channel in Discord. 5");
        }
    }

    console.log(`Waiting for ${remainingTime} seconds before reconnecting client: ${client.application.name}`);

    const timer = setInterval(() => {
        remainingTime--;
        console.log(`Remaining time: ${remainingTime} seconds`);
        if (remainingTime <= 5) {
            if (config.useEmbed === true) {
                const msgEmbed = new EmbedBuilder()
                    .setColor(config.setColor)
                    .setTitle(config.setTitle)
                    .setDescription("[ThirdEye]:" + " Client is rebooting in: " + remainingTime + " Seconds")
                    .setAuthor({ name: "‎", iconURL: config.logoURL });

                if (typeof anticheatChannelId === "object") {
                    anticheatChannelId.send({ embeds: [msgEmbed] });
                } else {
                    return console.log("I could not find the paradoxLogs channel in Discord. 6");
                }
            } else {
                if (typeof anticheatChannelId === "object") {
                    anticheatChannelId.send(`[ThirdEye]: Client is rebooting in: **${remainingTime} ** Seconds`);
                } else {
                    return console.log("I could not find the paradoxLogs channel in Discord. 7");
                }
            }
        }

        if (remainingTime <= 0) {
            clearInterval(timer);

            process.exit(); // Exit the script
        }
    }, 1000); // Delay of 1 second
});

//Send ingame message to discord.
bot.on("text", (packet: JsonPacket | ChatPacket) => {
    //Check the packet type.
    switch (packet.type) {
        case "json": {
            const msg = packet.message;
            const obj = JSON.parse(msg);
            /*As paradox is now using json packets for chat due to the restrictions in the API via the 1.20.60 update 
            this checks to make sure the packet is not a command result etc where the text value is not present.
            */
            if (obj.rawtext[0].translate) {
                break;
            }
            if (obj.rawtext[0].text.includes("Discord")) {
                //don't send the message otherwise it will loop
                break;
            }
            //Patch to prevent blank messages from paradox
            if (obj.rawtext[0].text === "") {
                break;
            }
            //continue to send the message to discord

            if (
                obj.rawtext[0].text.includes("§r§4[§6Paradox§4]§r") ||
                obj.rawtext[0].text.includes("§r§6[§aScythe§6]§r") ||
                obj.rawtext[0].text.includes("§l§6[§4Paradox§6]§r") ||
                obj.rawtext[0].text.includes("§l§6[§4Paradox AntiCheat Command Help§6]") ||
                obj.rawtext[0].text.includes("§f§o§4[§6Paradox§4]§f§o") ||
                obj.rawtext[0].text.includes("§f§4[§6Paradox§4]§f") ||
                obj.rawtext[0].text.includes("§2[§7Available Commands§2]§r") ||
                obj.rawtext[0].text.includes("§2[§7Paradox§2]§o§7") ||
                obj.rawtext[0].text.includes("§l§o§6[§4Paradox AntiCheat Command Help§6]§r§o")
            ) {
                // this will prevent it crashing. or logging to the wrong channel.
                return;
            }

            const correctedText = autoCorrect(obj.rawtext[0].text, correction);
            if (config.useEmbed === true) {
                const msgEmbed = new EmbedBuilder()
                    .setColor(config.setColor)
                    .setTitle(config.setTitle)
                    .setDescription("[In Game] " + correctedText)
                    .setAuthor({ name: "‎", iconURL: config.logoURL });

                if (typeof channelId === "object") {
                    return channelId.send({ embeds: [msgEmbed] });
                } else {
                    return console.log("I could not find the in-game channel in Discord. 6");
                }
            } else {
                if (typeof channelId === "object") {
                    return channelId.send(`[In Game] ${correctedText}`);
                } else {
                    return console.log("I could not find the in-game channel in Discord. 7");
                }
            }
        }

        // Normal chat message
        case "chat": {
            if (config.useEmbed === true) {
                const msgEmbed = new EmbedBuilder()
                    .setColor(config.setColor)
                    .setTitle(config.setTitle)
                    .setDescription("[In Game] " + packet.source_name + ": " + packet.message)
                    .setAuthor({ name: "‎", iconURL: config.logoURL });
                if (typeof channelId === "object") {
                    return channelId.send({ embeds: [msgEmbed] });
                } else {
                    return console.log("I could not find the in-game channel in Discord. 8");
                }
            } else {
                if (typeof channelId === "object") {
                    return channelId.send(`[In Game] **${packet.source_name}**: ${packet.message}`);
                } else {
                    return console.log("I could not find the in-game channel in Discord. 9");
                }
            }
        }
    }
});
// Player leave messages.
bot.on("text", (packet: WhisperPacket | ChatPacket) => {
    //Check for player leaving and report this back to discord.
    if (packet.message.includes("§e%multiplayer.player.left")) {
        const msg = packet.parameters + ": Has left the server.";
        const username = "Server";
        if (config.useEmbed === true) {
            const msgEmbed = new EmbedBuilder()
                .setColor([255, 0, 0])
                .setTitle(config.setTitle)
                .setDescription("[In Game] " + username + ": " + msg)
                .setAuthor({ name: "‎", iconURL: config.logoURL });
            if (typeof channelId === "object") {
                return channelId.send({ embeds: [msgEmbed] });
            } else {
                return console.log("I could not find the paradoxLogs channel in Discord. 14");
            }
        } else {
            if (typeof channelId === "object") {
                return channelId.send(`[In Game] **${username}**: ${msg}`);
            } else {
                return console.log("I could not find the paradoxLogs channel in Discord. 15");
            }
        }
    }
});
// Handling the multiplayer.player.joined system message
bot.on("text", (packet: WhisperPacket | ChatPacket) => {
    if (packet.message.includes("§e%multiplayer.player.joined")) {
        /* we don't want to duplicate the join message as this is handled in the add_player packet.
        in the event that the packet is not sent by the server allow the user to enable this message.
        */
        if (config.useSystemPlayerJoinMessage === true) {
            const msg = packet.parameters + ": Has joined the server.";
            const username = "Server";
            if (config.useEmbed === true) {
                const msgEmbed = new EmbedBuilder()
                    .setColor([0, 255, 0])
                    .setTitle(config.setTitle)
                    .setDescription("[In Game] " + username + ": " + msg)
                    .setAuthor({ name: "‎", iconURL: config.logoURL });

                if (typeof channelId === "object") {
                    return channelId.send({ embeds: [msgEmbed] });
                } else {
                    return console.log("I could not find the in-game channel in Discord. 16");
                }
            } else {
                if (typeof channelId === "object") {
                    return channelId.send(`[In Game] **${username}**: ${msg}`);
                } else {
                    return console.log("I could not find the in-game channel in Discord. 17");
                }
            }
        }
        //if not enabled it wont be sent.
        return;
    }
});

//grab the records of players online till we find the bot and then set the clientEntityID.
bot.on("player_list", (packet) => {
    if (packet.records && packet.records.records && packet.records.records.length > 0) {
        const playerRecord = packet.records.records[0];
        const entityUniqueId = playerRecord.entity_unique_id?.toString() || "N/A";
        const username = playerRecord.username || "N/A";
        console.log("Entity Unique ID:", entityUniqueId);
        console.log("Username:", username);
        // @ts-ignore
        if (username === bot.username) {
            clientEntityID = entityUniqueId;
            console.log("Found the bots ID. This has been saved.");
        }
    }
});
bot.on("update_abilities", (packet: UpdateAbilities) => {
    const entityUniqueId = packet.entity_unique_id;
    const permissionLevel = packet.permission_level;
    clientPermissionLevel = permissionLevel;
    console.log("Received Update Abilities Packet:");
    console.log("Entity Unique ID:", entityUniqueId);
    console.log("Permission Level:", permissionLevel);
    if (entityUniqueId.toString() === clientEntityID.toString() && permissionLevel === "operator") {
        //update the var clientPermissionLevel.
        clientPermissionLevel = permissionLevel;
        if (typeof systemCommandsChannelId === "object") {
            const msgEmbedOp = new EmbedBuilder().setColor(0x2ffc01).setTitle(config.setTitle).setDescription("[ThirdEye]: The bot is a operator.").setAuthor({ name: "‎", iconURL: config.logoURL }).setThumbnail("https://i.imgur.com/bEgXSej.png");
            systemCommandsChannelId.send({ embeds: [msgEmbedOp] });
        } else {
            console.log("I could not find the channel in Discord. in sendMessageToDiscord()");
        }
        //if it has op put it into creative.
        if (permissionLevel === "operator") {
            const cmd = `/gamemode creative @s`;
            bot.queue("command_request", {
                command: cmd,
                origin: {
                    type: "player",
                    uuid: "",
                    request_id: "",
                },
                internal: false,
                version: 52,
            });
            console.log("The bot has tried to put its self into creative mode.");
        }
    } else {
        console.log("ID's dont match so bot has not be targeted.");
    }
});
bot.on("update_player_game_type", (packet: UpdatePlayerGameType) => {
    let PlayerUniqueId = packet.player_unique_id;
    if (PlayerUniqueId.toString() === clientEntityID.toString() && packet.gamemode === "creative") {
        clientGamemode = packet.gamemode;
        console.log("Bot is now in creative mode.");
        if (typeof systemCommandsChannelId === "object") {
            const msgEmbedOp = new EmbedBuilder().setColor(0x2ffc01).setTitle(config.setTitle).setDescription("[ThirdEye]: The bot is now in creative mode.").setAuthor({ name: "‎", iconURL: config.logoURL });
            systemCommandsChannelId.send({ embeds: [msgEmbedOp] });
        } else {
            console.log("I could not find the channel in Discord. in sendMessageToDiscord()");
        }
    } else {
        console.log("Error in update_player_game_type");
        console.log("PlayerUniqueId: " + PlayerUniqueId);
        console.log("clientEntityID: " + clientEntityID);
        console.log("clientGamemode:" + clientGamemode);
        console.log("packet.gamemode: " + packet.gamemode);
    }
});

//Check to see what the current permission level is alert the user via discord if the client needs to be opped.
let intervalId: NodeJS.Timeout;

function sendMessageToDiscord() {
    if (clientPermissionLevel === "member") {
        if (typeof systemCommandsChannelId === "object") {
            const msgEmbedOp = new EmbedBuilder()
                .setColor(0xffff00)
                .setTitle(config.setTitle)
                .setDescription("[ThirdEye]: You need to op the bot via the server console.")
                .setAuthor({ name: "‎", iconURL: config.logoURL })
                .setThumbnail("https://i.imgur.com/SO1qc2B.png");
            console.log("Sending warning message to discord to op the bot.");
            systemCommandsChannelId.send({ embeds: [msgEmbedOp] });
        } else {
            console.log("I could not find the channel in Discord. Function sendMessageToDiscord().");
        }
    } else if (clientPermissionLevel === "operator") {
        clearInterval(intervalId);
    }
}

if (clientPermissionLevel !== "operator") {
    intervalId = setInterval(sendMessageToDiscord, 10000);
}

export function autoCorrect(text: string, correction: { [key: string]: string }): string {
    const reg = new RegExp(Object.keys(correction).join("|"), "g");
    return text.replace(reg, (matched) => correction[matched as keyof typeof correction]);
}
if (config.debug == true) {
    bot.on("text", (packet) => {
        const message = packet.message;
        console.log(message);
    });
}
