import { MessagePayload, MessageCreateOptions } from "discord.js";
import { EmbedBuilder, TextBasedChannel } from "discord.js";
import config from "../config.js";
import { Client } from "bedrock-protocol";

/* Add to prevent the message being spammed this will allow the blacklist to work, 
it seems that when a player leaves the range of the bot account 
and returns it sends the message again.
*/
const Debug: boolean = false;

export function addPlayerListener(bot: Client, channelId: TextBasedChannel, WhitelistRead: any) {
    const Whitelist = WhitelistRead.whitelist;

    bot.on("add_player", (packet: PlayerData) => {
        const deviceOS = getDeviceName(packet.device_os);
        const gameDescription = `[In Game] ${packet.username}: Has joined the server using ${deviceOS}`;
        let description = gameDescription;

        if (config.blacklistDeviceTypes.includes(packet.device_os) && !Whitelist.includes(packet.username)) {
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

            description = `[Server] ${packet.username}: Has been kicked as the device has been blacklisted: ${packet.device_os}`;
        }
        if (Debug === true) {
            if (config.useEmbed === true) {
                const msgEmbed = new EmbedBuilder().setColor([0, 255, 0]).setTitle(config.setTitle).setDescription(description).setAuthor({ name: "‎", iconURL: config.logoURL });
                sendToChannel(channelId, { embeds: [msgEmbed] }, "I could not find the in-game channel in Discord. 2");
            } else {
                sendToChannel(channelId, description, "I could not find the in-game channel in Discord. 3");
            }
        }
    });
}

function sendToChannel(channelId: TextBasedChannel, content: string | MessagePayload | MessageCreateOptions, errorMessage: string) {
    if (typeof channelId === "object") {
        channelId.send(content);
    } else {
        console.log(errorMessage);
    }
}

function getDeviceName(deviceOS: string): string {
    switch (deviceOS) {
        case "Win10":
            return "Windows PC";
        case "IOS":
            return "Apple Device";
        case "Nintendo":
            return "Nintendo Switch";
        case "Android":
            return "Android";
        case "Orbis":
            return "PlayStation";
        default:
            console.log("DeviceOS defaulted to packet.device_os");
            return deviceOS;
    }
}
