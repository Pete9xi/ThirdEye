import { EmbedBuilder, TextBasedChannel } from "discord.js";
import config from "../config.js";
import { Client } from "bedrock-protocol";

export function setupWhisperListener(bot: Client, channelId: TextBasedChannel) {
    bot.on("text", (packet) => {
        if (packet.type === "whisper") {
            let playername = packet.source_name;
            let message = packet.message;
            let isEnabled = config.sendWhisperMessages;

            if (isEnabled === true) {
                sendWhisperMessage(channelId, playername, message);
            }
        }
    });
}
function sendWhisperMessage(channelId: TextBasedChannel, playername: string, message: string) {
    if (config.useEmbed === true) {
        const msgEmbed = new EmbedBuilder()
            .setColor(config.setColor)
            .setTitle(config.setTitle)
            .setDescription("[In Game] " + playername + " Whispered: " + message)
            .setAuthor({ name: "‎", iconURL: "https://i.imgur.com/FA3I1uu.png" });
        if (typeof channelId === "object") {
            channelId.send({ embeds: [msgEmbed] });
        } else {
            console.log("I could not find the in-game channel in Discord.");
        }
    } else {
        if (typeof channelId === "object") {
            channelId.send(`[In Game] **${playername}** Whispered: ${message}`);
        } else {
            console.log("I could not find the in-game channel in Discord.");
        }
    }
}
