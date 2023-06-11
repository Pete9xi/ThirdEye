const fs = require("fs");
const config = JSON.parse(fs.readFileSync("config.json", "utf-8"));
let WhitelistRead = JSON.parse(fs.readFileSync("whitelist.json", "utf-8"));
const uuid = require("uuid");
const { Client, GatewayIntentBits, EmbedBuilder, messageLink } = require("discord.js");
const { MessageContent, GuildMessages, Guilds } = GatewayIntentBits;
let channel = config.channel;
const token = config.token;
let paradoxChannel = config.paradoxLogsChannel;
let systemCommandsChannel = config.systemCommandsChannel;
var paradoxLogs = config.ParadoxEnabled;
const cmdPrefix = config.cmdPrefix;
const logSystemCommands = config.logSystemCommands;
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
var DeviceOS;

// create new discord client that can see what servers the bot is in, as well as the messages in those servers
const client = new Client({ intents: [Guilds, GuildMessages, MessageContent] });
client.login(token);

// load Bedrock-Protocol
const bedrock = require("bedrock-protocol");
const { subscribe } = require("diagnostics_channel");
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
    };
} else {
    console.log("Connecting to a server");
    options = {
        host: config.ip,
        port: config.port,
        username: config.username,
        offline: config.AuthType,
    };
}
// join server
const bot = bedrock.createClient(options);

//const bot = bedrock.createClient(options)
bot.on("spawn", () => {
    console.log(`Bedrock bot logged in as ${bot.username}`);
    if (config.useEmbed === true) {
        const msgEmbed = new EmbedBuilder()
            .setColor(config.setColor)
            .setTitle(config.setTitle)
            .setDescription("[ThirdEye]:" + " Client is logged in.");
        paradoxChannel.send({ embeds: [msgEmbed] });
    } else {
        paradoxChannel.send(`[ThirdEye]: Client is logged in.`);
    }
});

// when discord client is ready, send login message
client.once("ready", (c) => {
    console.log(`Discord bot logged in as ${c.user.tag}`);
    channel = client.channels.cache.get(channel);
    if (paradoxLogs === true) {
        paradoxChannel = client.channels.cache.get(paradoxChannel);
    }
    if (logSystemCommands === true) {
        systemCommandsChannel = client.channels.cache.get(systemCommandsChannel);
        console.log(`I could not find the channel the systemCommandsChannel Channel in discord.`);
    }

    if (!channel) {
        console.log(`I could not find the in game channel in Discord.`);
    }
    if (!paradoxChannel) {
        console.log(`I could not find the channel the paradoxLogs Channel in Discord`);
    }
});

client.on("messageCreate", (message) => {
    if (message.author.bot === true) {
        /**This check will prevent a loop back mesasge.
         * If the incoming message is from a bot it will ingore it.
         */
    } else {
        //get the list if admins
        var admins = config.admins;
        if (message.content.startsWith(cmdPrefix) && admins.includes(message.author.id) && message.channel.id === paradoxChannel.id) {
            console.log("command received: " + message.content + " From: " + message.author.id);
            bot.queue("text", {
                type: "chat",
                needs_translation: false,
                source_name: bot.username,
                xuid: "",
                platform_chat_id: "",
                message: `${message.content}`,
            });
            return;
        }
        if (message.content.startsWith("$") && admins.includes(message.author.id) && message.channel.id === paradoxChannel.id && !message.content.endsWith("-r") && !message.content.includes("$reboot")) {
            //add the user to the whitelist.
            var msg = message.content.replace("$", "");
            WhitelistRead.whitelist.push(msg);
            fs.writeFileSync("whitelist.json", JSON.stringify(WhitelistRead, null, 2), "utf-8");
            console.log("Data has been written to the file successfully.");
            WhitelistRead = JSON.parse(fs.readFileSync("whitelist.json", "utf-8"));
            console.log("Reloaded contents:", WhitelistRead.whitelist);
            return;
        }
        if (message.content.startsWith("$") && admins.includes(message.author.id) && message.channel.id === paradoxChannel.id && message.content.endsWith("-r") && !message.content.includes("$reboot")) {
            // remove the user from the whitelist.
            var msg = message.content.replace("$", "");
            var msgdel = msg.replace("-r", "");
            console.log("Removing: " + msgdel + "from the whitelist.");
            WhitelistRead.whitelist = WhitelistRead.whitelist.filter((name) => name !== msgdel);
            fs.writeFileSync("whitelist.json", JSON.stringify(WhitelistRead, null, 2), "utf-8");
            console.log("Data has been written to the file successfully.");
            WhitelistRead = JSON.parse(fs.readFileSync("whitelist.json", "utf-8"));
            console.log("Reloaded contents:", WhitelistRead.whitelist);
            return;
        }
        if (message.content === "$reboot" && admins.includes(message.author.id) && message.channel.id === paradoxChannel.id) {
            console.log("Forcing a re connect.");
            process.exit(); // Exit the script
        }
        if (message.channel.id === channel.id) {
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
    var Whitelist = WhitelistRead.whitelist;
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
            channel.send({ embeds: [msgEmbed] });
            return;
        } else {
            channel.send(`[Server] **${packet.username}** Has been kicked as the device has been blacklisted: ${packet.device_os}`);
            return;
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
            DeviceOS = "PS4";
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
        channel.send({ embeds: [msgEmbed] });
    } else {
        channel.send(`[In Game] **${packet.username}** Has joined the server using ${DeviceOS}`);
    }
});
bot.on("close", (packet) => {
    console.log(" The server has closed the connection.");
});
bot.on("login", (packet) => {
    console.log("client has been authenticated by the server.");
});
bot.on("join", (packet) => {
    console.log("the client is ready to recieve game packets.");
});
bot.on("disconnect", (packet) => {
    console.log("Client disconnected:", bot.uuid);
    let remainingTime = 2 * 60; // 2 minutes in seconds, allowing for slower servers to reboot in time ready for a new connection
    if (config.useEmbed === true) {
        const msgEmbed = new EmbedBuilder()
            .setColor(config.setColor)
            .setTitle(config.setTitle)
            .setDescription("[ThirdEye]:" + " The client has lost connection to the server and will initiate a reboot in: " + remainingTime + " Seconds");
        paradoxChannel.send({ embeds: [msgEmbed] });
    } else {
        paradoxChannel.send(`[ThirdEye]: The client has lost connection to the server and will initiate a reboot in: **${remainingTime} ** Seconds`);
    }

    console.log(`Waiting for ${remainingTime} seconds before reconnecting client: ${client.uuid}`);

    const timer = setInterval(() => {
        remainingTime--;
        console.log(`Remaining time: ${remainingTime} seconds`);
        if (remainingTime <= 5) {
            if (config.useEmbed === true) {
                const msgEmbed = new EmbedBuilder()
                    .setColor(config.setColor)
                    .setTitle(config.setTitle)
                    .setDescription("[ThirdEye]:" + " Client is rebooting in: " + remainingTime + " Seconds");
                paradoxChannel.send({ embeds: [msgEmbed] });
            } else {
                paradoxChannel.send(`[ThirdEye]: Client is rebooting in: **${remainingTime} ** Seconds`);
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
        case "json_whisper":
            const msg = packet.message;
            var obj = JSON.parse(msg);
            var correctedText;
            if (obj.rawtext[0].text.includes("Discord")) {
                //dont send the message otherwise it will loop
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

            correctedText = autoCorrect(obj.rawtext[0].text, correction);
            if (config.useEmbed === true) {
                const msgEmbed = new EmbedBuilder()
                    .setColor(config.setColor)
                    .setTitle(config.setTitle)
                    .setDescription("[In Game] " + correctedText);
                channel.send({ embeds: [msgEmbed] });
                return;
            } else {
                channel.send(`[In Game] ${paradoxMsg}`);
                return;
            }

        // Normal chat messsage
        case "chat":
            if (config.useEmbed === true) {
                const msgEmbed = new EmbedBuilder()
                    .setColor(config.setColor)
                    .setTitle(config.setTitle)
                    .setDescription("[In Game] " + packet.source_name + ": " + packet.message);
                channel.send({ embeds: [msgEmbed] });
                return;
            } else {
                channel.send(`[In Game] **${packet.source_name}**: ${packet.message}`);
                return;
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
        var obj = JSON.parse(msg);
        var paradoxMsg;
        var correctedText;
        //Is a seprate logging channel enabled to send logs to that channel?
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
                        const toolsUtilitiesStartIndex = correctedText.indexOf("[Tools and Utilites]");

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
                        paradoxChannel.send({ embeds: [msgEmbed] });

                        // Send Part 2
                        let msgEmbed1 = new EmbedBuilder().setColor(config.setColor).setDescription("[In Game] " + optionalFeaturesMessage);
                        paradoxChannel.send({ embeds: [msgEmbed1] });
                        // Send Part 3
                        let msgEmbed2 = new EmbedBuilder().setColor(config.setColor).setDescription("[In Game] " + toolsUtilitiesMessage);
                        paradoxChannel.send({ embeds: [msgEmbed2] });

                        return;
                    }

                    const msgEmbed = new EmbedBuilder()
                        .setColor(config.setColor)
                        .setTitle(config.setTitle)
                        .setDescription("[In Game] " + correctedText);
                    paradoxChannel.send({ embeds: [msgEmbed] });
                    return;
                } else {
                    paradoxChannel.send(`[In Game] Paradox: ${paradoxMsg}`);
                    return;
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
                    paradoxChannel.send({ embeds: [msgEmbed] });
                    return;
                } else {
                    paradoxChannel.send(`[In Game] Paradox: ${paradoxMsg}`);
                    return;
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
                    paradoxChannel.send({ embeds: [msgEmbed] });
                    return;
                } else {
                    paradoxChannel.send(`[In Game] Paradox: ${paradoxMsg}`);
                    return;
                }
            }
        }

        //if not then just send it to the normal channel
        if (obj.rawtext[0].text.startsWith("§r§4[§6Paradox§4]§r")) {
            var paradoxMsg = obj.rawtext[0].text.replace("§r§4[§6Paradox§4]§r", "");
            if (config.useEmbed === true) {
                const msgEmbed = new EmbedBuilder()
                    .setColor(config.setColor)
                    .setTitle(config.setTitle)
                    .setDescription("[In Game] " + "Paradox" + ": " + paradoxMsg);
                channel.send({ embeds: [msgEmbed] });
                return;
            } else {
                channel.send(`[In Game] Paradox: ${paradoxMsg}`);
                return;
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
                channel.send({ embeds: [msgEmbed] });
                return;
            } else {
                channel.send(`[In Game] Paradox: ${paradoxMsg}`);
                return;
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
                channel.send({ embeds: [msgEmbed] });
                return;
            } else {
                channel.send(`[In Game] Paradox: ${paradoxMsg}`);
                return;
            }
        }
    }
});
// Player leave messages.
bot.on("text", (packet) => {
    //Check for player leaving and report thi back to discord.
    if (packet.message.includes("§e%multiplayer.player.left")) {
        if (config.useEmbed === true) {
            var msg = packet.parameters + ": Has left the server.";
            var username = "Server";
            const msgEmbed = new EmbedBuilder()
                .setColor(config.setColor)
                .setTitle(config.setTitle)
                .setDescription("[In Game] " + username + ": " + msg);
            channel.send({ embeds: [msgEmbed] });
            return;
        } else {
            channel.send(`[In Game] **${username}**: ${msg}`);
            return;
        }
    }
});
// Handling the multiplayer.player.joined system message
bot.on("text", (packet) => {
    if (packet.message.includes("§e%multiplayer.player.joined")) {
        /* we dont want to duplicate the join message as this is handled in the add_player packet.
        in the event that the packet is not sent by the server allow the user to enable this message.
        */
        if (config.useSystemPlayerJoinMessage === true) {
            if (config.useEmbed === true) {
                var msg = packet.parameters + ": Has joined the server.";
                var username = "Server";
                const msgEmbed = new EmbedBuilder()
                    .setColor(config.setColor)
                    .setTitle(config.setTitle)
                    .setDescription("[In Game] " + username + ": " + msg);
                channel.send({ embeds: [msgEmbed] });
                return;
            } else {
                channel.send(`[In Game] **${username}**: ${msg}`);
                return;
            }
        }
        //if not enabled it wont be sent.
        return;
    }
});
// Death messages
bot.on("text", (packet) => {
    if (packet.message.includes("death")) {
        let playername;
        playername = packet.parameters[0];
        //tamed
        if (playername.includes("%entity")) {
            playername = "A tamed Animal ";
        }
        reason = packet.parameters[1];
        // General death messages
        console.log(packet);

        if (packet.message.includes("death.attack.mob") || packet.message.includes("death.attack.arrow") || packet.message.includes("death.attack.indirectMagic") || packet.message.includes("death.attack.bullet")) {
            switch (reason) {
                case "%entity.zombie.name":
                    reason = "was killed by a Zombie.";
                    break;
                case "%entity.skeleton.name":
                    reason = "was killed by a Skeletons Arrow.";
                    break;
                case "%entity.spider.name":
                    reason = "was killed by a Spider.";
                    break;
                case "%entity.enderman.name":
                    reason = "was killed by a Enderman.";
                    break;
                case "%entity.zombie_pigman.name":
                    reason = "was killed by a Zombie Pigman.";
                    break;
                case "%entity.iron_golem.name":
                    reason = "was killed by an Iron Golem.";
                    break;
                case "%entity.piglin_brute.name":
                    reason = "was killed by a Piglin Brute.";
                    break;
                case "%entity.piglin.name":
                    reason = "was killed by a Piglin.";
                    break;
                case "%entity.wither_skeleton.name":
                    reason = "was killed by a Wither Skeleton.";
                    break;
                case "%entity.bee.name":
                    reason = "was chased by bees and got stung to death.";
                    break;
                case "%entity.magma_cube.name":
                    reason = "was killed by a magma cube.";
                    break;
                case "%entity.zoglin.name":
                    reason = "was killed by a zoglin.";
                    break;
                case "%entity.blaze.name":
                    reason = "was killed by a blaze.";
                    break;
                case "%entity.polar_bear.name":
                    reason = "was killed by a polar bear.";
                    break;
                case "%entity.wolf.name":
                    reason = "was killed by a pack of wolfs.";
                    break;
                case "%entity.guardian.name":
                    reason = "was killed by a guardian.";
                    break;
                case "%entity.elder_guardian.name":
                    reason = "was killed by a elder gaurdain.";
                    break;
                case "%entity.stray.name":
                    reason = "was killed by a stray.";
                    break;
                case "%entity.husk.name":
                    reason = "was killed by a Husk.";
                    break;
                case "%entity.pillager.name":
                    reason = "was killed by a Pillger.";
                    break;
                case "%entity.vex.name":
                    reason = "was killed by a Vex.";
                    break;
                case "%entity.evocation_illager.name":
                    reason = "was killed by an Evoker's magic powers.";
                    break;
                case "%entity.vindicator.name":
                    reason = "was killed by a vindicator.";
                    break;
                case "%entity.shulker.name":
                    reason = "was shot by a shulker.";
                    break;
                case "%entity.ender_dragon.name":
                    if (packet.message.includes("death.attack.indirectMagic")) {
                        reason = "was killed by the ender dragons magic. ";
                        break;
                    } else {
                        reason = "was yeeted by the ender dragon.";
                        break;
                    }
                case "%entity.witch.name":
                    reason = "was killed by a witch.";
                    break;
                case "%entity.warden.name":
                    reason = "got flattend by the warden.";
                    break;
                default:
                    reason = "Was Killed." + "  ---  " + packet.message + " ----  " + packet.parameters;
            }
        } else {
            switch (packet.message) {
                case "death.attack.inWall":
                    reason = "Suffocated to death!";
                    break;
                case "death.attack.explosion.player":
                    reason = "Was Blown to bits by an explosion";
                    break;
                case "death.attack.onFire":
                    reason = "Went up in flames!";
                    break;
                case "death.attack.player":
                    reason = "Was killed by " + packet.parameters[1];
                    break;
                case "death.attack.inFire":
                    reason = "tried to take a bath in lava.";
                    break;
                case "death.attack.drown":
                    reason = packet.parameters[1] + " drowned to death!";
                    break;
                case "death.attack.outOfWorld":
                    reason = "Fell into the void.";
                    break;
                case "death.attack.sonicBoom.player":
                    reason = "Was blasted by the wardens sonic boom.";
                    break;
                case "death.fell.accident.generic":
                    reason = "Fell to their death.";
                    break;
                case "death.attack.fall":
                    reason = "Fell to their death.";
                    break;
                case "death.attack.player.item":
                    reason = "Was killed by " + packet.parameters[1];
                    break;
                case "death.attack.lava":
                    reason = "Was playing with lava and died.";
                    break;
                default:
                    reason = "General Death" + "  ---  " + packet.message + " ----  " + packet.parameters;
                    break;
            }
        }

        if (config.useEmbed === true) {
            const msgEmbed = new EmbedBuilder()
                .setColor(config.setColor)
                .setTitle(config.setTitle)
                .setDescription("[In Game] " + playername + ": " + reason);
            channel.send({ embeds: [msgEmbed] });
            return;
        } else {
            channel.send(`[In Game] **${playername}**: ${reason}`);
            return;
        }
    }
});
// Logging system commands
bot.on("text", (packet) => {
    if (logSystemCommands === false) {
        //check to see if logging we need to log system commands to discord.
    } else {
        var systemMessage;
        var playerName;
        var successMessage;
        var dontSendMessage = false;
        if (packet.type === "json") {
            var obj = JSON.parse(packet.message);
            if (excludedPackets.some((excludedPacket) => packet.message.includes(excludedPacket))) {
                return;
                // we want to exclude this packet
            }
            playerName = obj.rawtext[1].translate;

            // loop through the array to get the the values.
            if (obj.rawtext[3] && obj.rawtext[3].with && obj.rawtext[3].with.rawtext && obj.rawtext[3].with.rawtext[0]) {
                var rawtextArray = obj.rawtext[3].with.rawtext;
                var results = [];
                for (var i = 0; i < rawtextArray.length; i++) {
                    if (rawtextArray[i].text) {
                        results.push(rawtextArray[i].text);
                    }
                }
                systemMessage = results;
            } else {
                systemMessage = "";
            }
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
                systemCommandsChannel.send({ embeds: [msgEmbed] });
                return;
            } else {
                systemCommandsChannel.send(`[System Message] **${systemMessage}`);
                return;
            }
        }
    }
});

function autoCorrect(text, correction) {
    const reg = new RegExp(Object.keys(correction).join("|"), "g");
    return text.replace(reg, (matched) => correction[matched]);
}
