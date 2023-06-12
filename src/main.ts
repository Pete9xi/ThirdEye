import { readFileSync, writeFileSync } from "fs";
import { Client, GatewayIntentBits, EmbedBuilder, TextBasedChannel } from "discord.js";
import { createClient, ClientOptions } from "bedrock-protocol";
import config from "./config.js";
import { setupDeathListener } from "./death_listener/deathMessage.js";

let WhitelistRead = JSON.parse(readFileSync("whitelist.json", "utf-8"));
const { MessageContent, GuildMessages, Guilds } = GatewayIntentBits;
const channel: string = config.channel;
let channelId: TextBasedChannel;
const token = config.token;
const paradoxChannel: string = config.paradoxLogsChannel;
let paradoxChannelId: TextBasedChannel;
const systemCommandsChannel: string = config.systemCommandsChannel;
let systemCommandsChannelId: TextBasedChannel;
const paradoxLogs = config.ParadoxEnabled;
const cmdPrefix = config.cmdPrefix;
const logSystemCommands = config.logSystemCommands;
var clientPermissionLevel;
var notifyDiscordPermissionLevel: boolean;
const correction = {
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
    "§3[§bUAC§3]§": "[UAC]",
    "§¶§cUAC ►": "UAC ►",
    "§¶§cUAC STAFF §b► §d": "UAC STAFF ►",
    "§r§6[§aScythe§6]§r": "",
};

const excludedPackets = ["commands.tp.successVictim", "gameMode.changed", "commands.give.successRecipient"];

//Device OS ids to be converted to more friendly names
let DeviceOS;

// create new discord client that can see what servers the bot is in, as well as the messages in those servers
const client = new Client({ intents: [Guilds, GuildMessages, MessageContent] });
client.login(token);

let options;
console.log("ThirdEye v1.0.0");
// bot options
if (config.isRealm) {
    //Handel the realm config here!
    console.log("Connecting to a realm");
    options = {
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
            .setDescription("[ThirdEye]:" + " Client is logged in.");

        if (typeof paradoxChannelId === "object") {
            return paradoxChannelId.send({ embeds: [msgEmbed] });
        } else {
            return console.log("I could not find the paradoxLogs channel in Discord. 1");
        }
    } else {
        if (typeof paradoxChannelId === "object") {
            return paradoxChannelId.send("[ThirdEye]: Client is logged in.");
        } else {
            return console.log("I could not find the paradoxLogs channel in Discord. 2");
        }
    }
});

// when discord client is ready, send login message
client.once("ready", (c) => {
    console.log(`Discord bot logged in as ${c.user.tag}`);
    const channelObj = client.channels.cache.get(channel);
    if (channelObj) {
        channelId = channelObj as TextBasedChannel;
    } else {
        console.log(`I could not find the in-game channel in Discord. 1`);
    }

    if (paradoxLogs === true) {
        const paradoxChannelObj = client.channels.cache.get(paradoxChannel);
        if (paradoxChannelObj) {
            paradoxChannelId = paradoxChannelObj as TextBasedChannel;
        } else {
            console.log(`I could not find the paradoxLogs Channel in Discord. 3`);
        }
    }

    if (logSystemCommands === true) {
        const systemChannelObj = client.channels.cache.get(systemCommandsChannel);
        if (systemChannelObj) {
            systemCommandsChannelId = systemChannelObj as TextBasedChannel;
        } else {
            console.log(`I could not find the paradoxLogs Channel in Discord. 3`);
        }
    }

    if (!channel) {
        console.log(`I could not find the in game channel in Discord. Not Ready?`);
    }
    if (!paradoxChannel) {
        console.log(`I could not find the paradoxLogs Channel in Discord. Not Ready?`);
    }

    setupDeathListener(bot, channelId);
});

client.on("messageCreate", (message) => {
    if (message.author.bot === true) {
        /**This check will prevent a loop back message.
         * If the incoming message is from a bot it will ignore it.
         */
    } else {
        //get the list if admins
        const admins = config.admins;
        if (message.content.startsWith(cmdPrefix) && admins.includes(message.author.id) && paradoxChannel && message.channel.id === paradoxChannelId.id) {
            console.log("command received: " + message.content + " From: " + message.author.id);
            bot.queue("text", {
                type: "chat",
                needs_translation: false,
                source_name: config.username,
                xuid: "",
                platform_chat_id: "",
                message: `${message.content}`,
            });
            return;
        }

        if (message.content.startsWith("$") && admins.includes(message.author.id) && paradoxChannel && message.channel.id === paradoxChannelId.id && !message.content.endsWith("-r") && !message.content.includes("$reboot")) {
            //add the user to the whitelist.
            const msg = message.content.replace("$", "");
            WhitelistRead.whitelist.push(msg);
            writeFileSync("whitelist.json", JSON.stringify(WhitelistRead, null, 2), "utf-8");
            console.log("Data has been written to the file successfully.");
            WhitelistRead = JSON.parse(readFileSync("whitelist.json", "utf-8"));
            console.log("Reloaded contents:", WhitelistRead.whitelist);
            return;
        }
        if (message.content.startsWith("$") && admins.includes(message.author.id) && paradoxChannel && message.channel.id === paradoxChannelId.id && message.content.endsWith("-r") && !message.content.includes("$reboot")) {
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
        if (message.content === "$reboot" && admins.includes(message.author.id) && paradoxChannel && message.channel.id === paradoxChannelId.id) {
            console.log("Forcing a re connect.");
            process.exit(); // Exit the script
        }
        if (channel && message.channel.id === channelId.id) {
            //We will then send a command to the server to trigger the message sent in discord.
            const cmd = `/tellraw @a {"rawtext":[{"text":"§8[§9Discord§8] §7${message.author.username}: §f${message.content}"}]}`;
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

//Send connecting players device os to discord.
bot.on("add_player", (packet) => {
    const Whitelist = WhitelistRead.whitelist;
    if (config.blacklistDeviceTypes.includes(packet.device_os) && !Whitelist.includes(packet.username)) {
        //Kick the client connecting bye bye
        const cmd = `/kick ${packet.username} device is blacklisted.`;
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
        if (config.useEmbed === true) {
            const msgEmbed = new EmbedBuilder()
                .setColor(config.setColor)
                .setTitle(config.setTitle)
                .setDescription("[Server] " + packet.username + ": Has been kicked as the device has been blacklisted:  " + packet.device_os);
            if (typeof channelId === "object") {
                return channelId.send({ embeds: [msgEmbed] });
            } else {
                return console.log("I could not find the in-game channel in Discord. 2");
            }
        } else {
            if (typeof channelId === "object") {
                return channelId.send(`[Server] **${packet.username}** Has been kicked as the device has been blacklisted: ${packet.device_os}`);
            } else {
                return console.log("I could not find the in-game channel in Discord. 3");
            }
        }
    }
    switch (packet.device_os) {
        case "Win10":
            DeviceOS = "Windows PC";
            break;
        case "IOS":
            DeviceOS = "Apple Device";
            break;
        case "Nintendo":
            DeviceOS = "Nintendo Switch";
            break;
        case "Android":
            DeviceOS = "Android";
            break;
        case "Orbis":
            DeviceOS = "PlayStation";
        // just send default
        default:
            DeviceOS = packet.device_os;
            console.log("DeviceOS defaulted to packet.device_os");
    }

    if (config.useEmbed === true) {
        const msgEmbed = new EmbedBuilder()
            .setColor(config.setColor)
            .setTitle(config.setTitle)
            .setDescription("[In Game] " + packet.username + ": Has joined the server using " + DeviceOS);

        if (typeof channelId === "object") {
            return channelId.send({ embeds: [msgEmbed] });
        } else {
            return console.log("I could not find the in-game channel in Discord. 2");
        }
    } else {
        if (typeof channelId === "object") {
            return channelId.send(`[In Game] **${packet.username}** Has joined the server using ${DeviceOS}`);
        } else {
            return console.log("I could not find the in-game channel in Discord. 3");
        }
    }
});
bot.on("close", () => {
    console.log(" The server has closed the connection.");
});
bot.on("login", () => {
    console.log("client has been authenticated by the server.");
});
bot.on("join", () => {
    console.log("the client is ready to receive game packets.");
});
bot.on("disconnect", (packet) => {
    console.log("Client disconnected:", bot.entityId);
    let remainingTime = 2 * 60; // 2 minutes in seconds, allowing for slower servers to reboot in time ready for a new connection
    if (config.useEmbed === true) {
        const msgEmbed = new EmbedBuilder()
            .setColor(config.setColor)
            .setTitle(config.setTitle)
            .setDescription("[ThirdEye]:" + " The client has lost connection to the server and will initiate a reboot in: " + remainingTime + " Seconds");

        if (typeof paradoxChannelId === "object") {
            return paradoxChannelId.send({ embeds: [msgEmbed] });
        } else {
            return console.log("I could not find the paradoxLogs channel in Discord. 4");
        }
    } else {
        if (typeof paradoxChannelId === "object") {
            paradoxChannelId.send(`[ThirdEye]: The client has lost connection to the server and will initiate a reboot in: **${remainingTime} ** Seconds`);
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
                    .setDescription("[ThirdEye]:" + " Client is rebooting in: " + remainingTime + " Seconds");

                if (typeof paradoxChannelId === "object") {
                    return paradoxChannelId.send({ embeds: [msgEmbed] });
                } else {
                    return console.log("I could not find the paradoxLogs channel in Discord. 6");
                }
            } else {
                if (typeof paradoxChannelId === "object") {
                    return paradoxChannelId.send(`[ThirdEye]: Client is rebooting in: **${remainingTime} ** Seconds`);
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
bot.on("text", (packet) => {
    //Check the packet type.
    switch (packet.type) {
        case "json_whisper": {
            const msg = packet.message;
            const obj = JSON.parse(msg);
            if (obj.rawtext[0].text.includes("Discord")) {
                //don't send the message otherwise it will loop
                break;
            }
            //continue to send the message to discord

            if (
                obj.rawtext[0].text.includes("§r§4[§6Paradox§4]§r") ||
                obj.rawtext[0].text.includes("UAC") ||
                obj.rawtext[0].text.includes("§r§6[§aScythe§6]§r") ||
                obj.rawtext[0].text.includes("§l§6[§4Paradox§6]§r") ||
                obj.rawtext[0].text.includes("§l§6[§4Paradox AntiCheat Command Help§6]")
            ) {
                // this will prevent it crashing. or logging to the wrong channel.
                return;
            }

            const correctedText = autoCorrect(obj.rawtext[0].text, correction);
            if (config.useEmbed === true) {
                const msgEmbed = new EmbedBuilder()
                    .setColor(config.setColor)
                    .setTitle(config.setTitle)
                    .setDescription("[In Game] " + correctedText);

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
                    .setDescription("[In Game] " + packet.source_name + ": " + packet.message);
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
//Paradox Messages
bot.on("text", (packet) => {
    if (
        packet.message.includes("§r§4[§6Paradox§4]§r") ||
        packet.message.includes("§¶§cUAC STAFF §b► §d") ||
        packet.message.includes("§r§6[§aScythe§6]§r") ||
        packet.message.includes("§l§6[§4Paradox§6]§r") ||
        packet.message.includes("§l§6[§4Paradox AntiCheat Command Help§6]")
    ) {
        const msg = packet.message;
        const obj = JSON.parse(msg);
        let paradoxMsg;
        let correctedText;
        //Is a separate logging channel enabled to send logs to that channel?
        if (paradoxLogs === true) {
            if (obj.rawtext[0].text.includes("§r§4[§6Paradox§4]§r") || obj.rawtext[0].text.includes("§l§6[§4Paradox§6]§r") || obj.rawtext[0].text.includes("§l§6[§4Paradox AntiCheat Command Help§6]")) {
                paradoxMsg = obj.rawtext[0].text;
                correctedText = autoCorrect(paradoxMsg, correction);
                if (config.useEmbed === true) {
                    if (correctedText.length >= 2000) {
                        console.log(correctedText.length);
                        // Extract the messages for each category
                        const moderationStartIndex = correctedText.indexOf("[Moderation Commands]");
                        const optionalFeaturesStartIndex = correctedText.indexOf("[Optional Features]");
                        const toolsUtilitiesStartIndex = correctedText.indexOf("[Tools and Utilities]");

                        const moderationEndIndex = optionalFeaturesStartIndex !== -1 ? optionalFeaturesStartIndex : toolsUtilitiesStartIndex;
                        const optionalFeaturesEndIndex = toolsUtilitiesStartIndex !== -1 ? toolsUtilitiesStartIndex : correctedText.length;

                        const moderationMessage = correctedText.substring(moderationStartIndex, moderationEndIndex).trim();
                        const optionalFeaturesMessage = correctedText.substring(optionalFeaturesStartIndex, optionalFeaturesEndIndex).trim();
                        const toolsUtilitiesMessage = correctedText.substring(toolsUtilitiesStartIndex).trim();

                        // Send Part 1
                        let msgEmbed = new EmbedBuilder()
                            .setColor(config.setColor)
                            .setTitle(config.setTitle)
                            .setDescription("[In Game] " + moderationMessage);

                        if (typeof paradoxChannelId === "object") {
                            paradoxChannelId.send({ embeds: [msgEmbed] });
                        } else {
                            console.log(`I could not find the channel for the paradoxLogs Channel in Discord. 8`);
                        }

                        // Send Part 2
                        let msgEmbed1 = new EmbedBuilder().setColor(config.setColor).setDescription("[In Game] " + optionalFeaturesMessage);
                        if (typeof paradoxChannelId === "object") {
                            paradoxChannelId.send({ embeds: [msgEmbed1] });
                        } else {
                            console.log(`I could not find the channel for the paradoxLogs Channel in Discord. 9`);
                        }
                        // Send Part 3
                        let msgEmbed2 = new EmbedBuilder().setColor(config.setColor).setDescription("[In Game] " + toolsUtilitiesMessage);
                        if (typeof paradoxChannelId === "object") {
                            paradoxChannelId.send({ embeds: [msgEmbed2] });
                        } else {
                            console.log(`I could not find the channel for the paradoxLogs Channel in Discord. 10`);
                        }

                        return;
                    }

                    const msgEmbed = new EmbedBuilder()
                        .setColor(config.setColor)
                        .setTitle(config.setTitle)
                        .setDescription("[In Game] " + correctedText);

                    if (typeof paradoxChannelId === "object") {
                        return paradoxChannelId.send({ embeds: [msgEmbed] });
                    } else {
                        return console.log("I could not find the paradoxLogs channel in Discord. 8");
                    }
                } else {
                    if (typeof paradoxChannelId === "object") {
                        return paradoxChannelId.send(`[In Game] Paradox: ${paradoxMsg}`);
                    } else {
                        return console.log("I could not find the paradoxLogs channel in Discord. 9");
                    }
                }
            }

            if (obj.rawtext[0].text.startsWith("§¶§cUAC STAFF §b► §d")) {
                paradoxMsg = obj.rawtext[0].text + obj.rawtext[1].text + obj.rawtext[2].text;
                correctedText = autoCorrect(paradoxMsg, correction);
                if (config.useEmbed === true) {
                    const msgEmbed = new EmbedBuilder()
                        .setColor(config.setColor)
                        .setTitle(config.setTitle)
                        .setDescription("[In Game] " + correctedText);
                    if (typeof paradoxChannelId === "object") {
                        return paradoxChannelId.send({ embeds: [msgEmbed] });
                    } else {
                        return console.log("I could not find the paradoxLogs channel in Discord. 10");
                    }
                } else {
                    if (typeof paradoxChannelId === "object") {
                        return paradoxChannelId.send(`[In Game] Paradox: ${paradoxMsg}`);
                    } else {
                        return console.log("I could not find the paradoxLogs channel in Discord. 11");
                    }
                }
            }
            if (obj.rawtext[0].text.startsWith("§r§6[§aScythe§6]§r")) {
                paradoxMsg = obj.rawtext[0].text;
                correctedText = autoCorrect(paradoxMsg, correction);
                if (config.useEmbed === true) {
                    const msgEmbed = new EmbedBuilder()
                        .setColor(config.setColor)
                        .setTitle(config.setTitle)
                        .setDescription("[In Game] " + correctedText);
                    if (typeof paradoxChannelId === "object") {
                        return paradoxChannelId.send({ embeds: [msgEmbed] });
                    } else {
                        return console.log("I could not find the paradoxLogs channel in Discord. 12");
                    }
                } else {
                    if (typeof paradoxChannelId === "object") {
                        return paradoxChannelId.send(`[In Game] Paradox: ${paradoxMsg}`);
                    } else {
                        return console.log("I could not find the paradoxLogs channel in Discord. 13");
                    }
                }
            }
        }

        //if not then just send it to the normal channel
        if (obj.rawtext[0].text.startsWith("§r§4[§6Paradox§4]§r")) {
            const paradoxMsg = obj.rawtext[0].text.replace("§r§4[§6Paradox§4]§r", "");
            if (config.useEmbed === true) {
                const msgEmbed = new EmbedBuilder()
                    .setColor(config.setColor)
                    .setTitle(config.setTitle)
                    .setDescription("[In Game] " + "Paradox" + ": " + paradoxMsg);
                if (typeof channelId === "object") {
                    return channelId.send({ embeds: [msgEmbed] });
                } else {
                    return console.log("I could not find the in-game channel in Discord. 10");
                }
            } else {
                if (typeof channelId === "object") {
                    return channelId.send(`[In Game] Paradox: ${paradoxMsg}`);
                } else {
                    return console.log("I could not find the in-game channel in Discord. 11");
                }
            }
        }
        if (obj.rawtext[0].text.startsWith("§¶§cUAC STAFF §b► §d")) {
            paradoxMsg = obj.rawtext[0].text + obj.rawtext[1].text + obj.rawtext[2].text;
            correctedText = autoCorrect(paradoxMsg, correction);
            if (config.useEmbed === true) {
                const msgEmbed = new EmbedBuilder()
                    .setColor(config.setColor)
                    .setTitle(config.setTitle)
                    .setDescription("[In Game] " + correctedText);
                if (typeof channelId === "object") {
                    return channelId.send({ embeds: [msgEmbed] });
                } else {
                    return console.log("I could not find the in-game channel in Discord. 12");
                }
            } else {
                if (typeof channelId === "object") {
                    return channelId.send(`[In Game] Paradox: ${paradoxMsg}`);
                } else {
                    return console.log("I could not find the in-game channel in Discord. 13");
                }
            }
        }
        if (obj.rawtext[0].text.startsWith("§r§6[§aScythe§6]§r")) {
            paradoxMsg = obj.rawtext[0].text;
            correctedText = autoCorrect(paradoxMsg, correction);
            if (config.useEmbed === true) {
                const msgEmbed = new EmbedBuilder()
                    .setColor(config.setColor)
                    .setTitle(config.setTitle)
                    .setDescription("[In Game] " + correctedText);
                if (typeof channelId === "object") {
                    return channelId.send({ embeds: [msgEmbed] });
                } else {
                    return console.log("I could not find the in-game channel in Discord. 14");
                }
            } else {
                if (typeof channelId === "object") {
                    return channelId.send(`[In Game] Paradox: ${paradoxMsg}`);
                } else {
                    return console.log("I could not find the in-game channel in Discord. 15");
                }
            }
        }
    }
});
// Player leave messages.
bot.on("text", (packet) => {
    //Check for player leaving and report thi back to discord.
    if (packet.message.includes("§e%multiplayer.player.left")) {
        const msg = packet.parameters + ": Has left the server.";
        const username = "Server";
        if (config.useEmbed === true) {
            const msgEmbed = new EmbedBuilder()
                .setColor(config.setColor)
                .setTitle(config.setTitle)
                .setDescription("[In Game] " + username + ": " + msg);
            if (typeof paradoxChannelId === "object") {
                return paradoxChannelId.send({ embeds: [msgEmbed] });
            } else {
                return console.log("I could not find the paradoxLogs channel in Discord. 14");
            }
        } else {
            if (typeof paradoxChannelId === "object") {
                return paradoxChannelId.send(`[In Game] **${username}**: ${msg}`);
            } else {
                return console.log("I could not find the paradoxLogs channel in Discord. 15");
            }
        }
    }
});
// Handling the multiplayer.player.joined system message
bot.on("text", (packet) => {
    if (packet.message.includes("§e%multiplayer.player.joined")) {
        /* we don't want to duplicate the join message as this is handled in the add_player packet.
        in the event that the packet is not sent by the server allow the user to enable this message.
        */
        if (config.useSystemPlayerJoinMessage === true) {
            const msg = packet.parameters + ": Has joined the server.";
            const username = "Server";
            if (config.useEmbed === true) {
                const msgEmbed = new EmbedBuilder()
                    .setColor(config.setColor)
                    .setTitle(config.setTitle)
                    .setDescription("[In Game] " + username + ": " + msg);

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

// Logging system commands
bot.on("text", (packet) => {
    if (logSystemCommands === false) {
        //check to see if logging we need to log system commands to discord.
    } else {
        let systemMessage;
        let playerName;
        let successMessage;
        const results = [];
        let dontSendMessage = false;
        if (packet.type === "json") {
            const obj = JSON.parse(packet.message);
            if (excludedPackets.some((excludedPacket) => packet.message.includes(excludedPacket))) {
                return;
                // we want to exclude this packet
            }
            //check to make sure the packet contains the players name if not we set it as server.
            if (obj.rawtext && obj.rawtext[1] && obj.rawtext[1].translate) {
                playerName = obj.rawtext[1].translate;
            } else {
                playerName = "Server";
            }

            // loop through the array to get the the values.
            if (obj.rawtext[3] && obj.rawtext[3].with && obj.rawtext[3].with.rawtext && obj.rawtext[3].with.rawtext[0]) {
                const rawtextArray = obj.rawtext[3].with.rawtext;

                for (let i = 0; i < rawtextArray.length; i++) {
                    if (rawtextArray[i].text) {
                        results.push(rawtextArray[i].text);
                    }
                }

                systemMessage = results;
            } else {
                systemMessage = "";
            }

            if (obj.rawtext[3] && obj.rawtext[3].translate) {
                successMessage = obj.rawtext[3].translate;
            } else {
                dontSendMessage = true;
            }

            switch (successMessage) {
                case "commands.time.set":
                    successMessage = "set time";
                    break;
                case "commands.gamemode.success.self":
                    successMessage = "Set their gamemode ";
                    switch (results[0]) {
                        case "%createWorldScreen.gameMode.creative":
                            systemMessage = "to Creative";
                            break;
                        case "%createWorldScreen.gameMode.survival":
                            systemMessage = "to Survival";
                            break;
                        case "%createWorldScreen.gameMode.adventure":
                            systemMessage = "to Adventure";
                            break;
                        case "%createWorldScreen.gameMode.spectator":
                            systemMessage = "to Spectator";
                            break;
                    }
                    break;

                case "commands.gamemode.success.other":
                    successMessage = "Has Set " + results[1] + " gamemode ";
                    switch (results[0]) {
                        case "%createWorldScreen.gameMode.creative":
                            systemMessage = "to Creative";
                            break;
                        case "%createWorldScreen.gameMode.survival":
                            systemMessage = "to Survival";
                            break;
                        case "%createWorldScreen.gameMode.adventure":
                            systemMessage = "to Adventure";
                            break;
                        case "%createWorldScreen.gameMode.spectator":
                            systemMessage = "to Spectator";
                            break;
                    }
                    break;

                case "commands.weather.clear":
                    systemMessage = "Clear";
                    successMessage = "Set the weather to ";
                    break;
                case "commands.weather.rain":
                    systemMessage = "Rain";
                    successMessage = "Set the weather to ";
                    break;
                case "commands.weather.thunder":
                    systemMessage = "Thunder";
                    successMessage = "Set the weather to ";
                    break;
                case "commands.difficulty.success":
                    successMessage = "Set the worlds difficulty to ";
                    switch (systemMessage) {
                        case "PEACEFUL":
                            systemMessage = "Peaceful";
                            break;
                        case "EASY":
                            systemMessage = "Easy";
                            break;
                        case "NORMAL":
                            systemMessage = "Normal";
                            break;
                        case "HARD":
                            systemMessage = "Hard";
                            break;
                    }
                    break;
                case "commands.setworldspawn.success":
                    successMessage = "Set world spawn to: ";
                    systemMessage = "X: " + results[0] + " Y: " + results[1] + " Z: " + results[2];
                    break;
                case "commands.tp.success":
                    successMessage = " has teleported: ";
                    systemMessage = results[0] + " to: " + results[1];
                    break;
                case "commands.give.success":
                    successMessage = "Has given: ";
                    systemMessage = results[2] + " item: " + results[0] + ", amount: " + results[1];
                    break;
                case "commands.enchant.success":
                    successMessage = " Has enchanted an item for: ";
                    systemMessage = results[0];
                    break;
                case "commands.clear.success":
                    successMessage = "Has cleared: " + results[0] + " inventory removing a total of: ";
                    systemMessage = results[1] + " items";
                    break;
                case "commands.effect.success":
                    successMessage = "has given an effect to " + results[2];
                    let potionResult = results[0];
                    potionResult = potionResult.replace(/%potion|\./g, "");
                    systemMessage = "effect type: " + potionResult + " duration: " + results[3] + " multiplier: " + results[1];
                    break;
                default:
            }
            //Send packet to the discord channel.
            if (dontSendMessage === false) {
                if (config.useEmbed === true) {
                    const msgEmbed = new EmbedBuilder()
                        .setColor(config.setColor)
                        .setTitle(config.setTitle)
                        //.setDescription('[System Message] ' + 'playerName = '+ playerName +  ' successMessage = ' + successMessage + ' systemMessage = ' + systemMessage )
                        .setDescription("[System Message] " + playerName + " " + successMessage + " " + systemMessage);
                    if (typeof systemCommandsChannelId === "object") {
                        systemCommandsChannelId.send({ embeds: [msgEmbed] });
                    } else {
                        console.log("I could not find the systemCommands channel in Discord. 1");
                    }
                } else {
                    if (typeof systemCommandsChannelId === "object") {
                        systemCommandsChannelId.send(`[System Message] **${systemMessage}`);
                    } else {
                        console.log("I could not find the systemCommands channel in Discord. 2");
                    }
                }
            }
        }
    }
});
bot.on("update_abilities", (packet) => {
    const entityUniqueId = packet.entity_unique_id;
    const permissionLevel = packet.permission_level;
    console.log("Received Update Abilities Packet:");
    console.log("Entity Unique ID:", entityUniqueId);
    console.log("Permission Level:", permissionLevel);
    //update the var clientPermissionLevel.
    clientPermissionLevel = permissionLevel;
    //if it has op put it into creative.
    if (permissionLevel === "operator") {
        const cmd = `/gamemode @s creative`;
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
        console.log("The bot has tried to put its self into creative.");
    }
});
if (clientPermissionLevel === "member") {
    /* the client needs to be opped in this case will notify the user
     * the user that they need to op the client via the server console.
     */
    notifyDiscordPermissionLevel = true;
}
if (clientPermissionLevel === "operator") {
    notifyDiscordPermissionLevel = false;
}
//Send message to discord.
function sendMessageToDiscord() {
    if (notifyDiscordPermissionLevel === true) {
        if (typeof systemCommandsChannelId === "object") {
            const msgEmbedOp = new EmbedBuilder().setColor(0xffff00).setTitle(config.setTitle).setDescription("[ThirdEye]: You need to op the bot via the server console.");
            console.log("sending message to discord to op the bot.");
            channelId.send({ embeds: [msgEmbedOp] });
        } else {
            console.log("I could not find the channel in Discord. in sendMessageToDiscord()");
        }
    }
}
//send the message every 60 seconds
setInterval(sendMessageToDiscord, 60000);

function autoCorrect(text: string, correction: { [key: string]: string }): string {
    const reg = new RegExp(Object.keys(correction).join("|"), "g");
    return text.replace(reg, (matched) => correction[matched as keyof typeof correction]);
}
