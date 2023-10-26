import { EmbedBuilder, MessageCreateOptions, MessagePayload, TextBasedChannel } from "discord.js";
import config from "../config.js";
import { autoCorrect } from "../main.js";
import { correction } from "../main.js";
import { Client } from "bedrock-protocol";
let thumbUrl: string;
export function setupAntiCheatListener(bot: Client, channelId: TextBasedChannel) {
    bot.on("text", (packet: WhisperPacket | ChatPacket) => {
        const message = packet.message;

        const isAntiCheatMessage =
            message.includes("§r§4[§6Paradox§4]§r") ||
            message.includes("§¶§cUAC STAFF §b► §d") ||
            message.includes("§r§6[§aScythe§6]§r") ||
            message.includes("§l§6[§4Paradox§6]§r") ||
            message.includes("§l§6[§4Paradox AntiCheat Command Help§6]") ||
            message.includes("§f§o§4[§6Paradox§4]§f§o") ||
            message.includes("§f§4[§6Paradox§4]§f") ||
            message.includes("§l§o§6[§4Paradox AntiCheat Command Help§6]§r§o");

        if (!isAntiCheatMessage) {
            return;
        }
        const obj = JSON.parse(message);
        const rawText = obj.rawtext[0]?.text || "";
        let antiCheatMsg;
        let correctedText;
        if (
            rawText.includes("§r§4[§6Paradox§4]§r") ||
            rawText.includes("§l§6[§4Paradox§6]§r") ||
            rawText.includes("§l§6[§4Paradox AntiCheat Command Help§6]") ||
            rawText.includes("§f§o§4[§6Paradox§4]§f§o") ||
            rawText.includes("§f§4[§6Paradox§4]§f") ||
            rawText.includes("§l§o§6[§4Paradox AntiCheat Command Help§6]§r§o")
        ) {
            antiCheatMsg = rawText;
            correctedText = autoCorrect(antiCheatMsg, correction);
        } else if (rawText.startsWith("§¶§cUAC STAFF §b► §d")) {
            antiCheatMsg =
                rawText +
                obj.rawtext
                    .slice(1, 3)
                    .map((t: { text: string }) => t.text)
                    .join("");
            correctedText = autoCorrect(antiCheatMsg, correction);
        } else if (rawText.startsWith("§r§6[§aScythe§6]§r")) {
            antiCheatMsg = rawText;
            correctedText = autoCorrect(antiCheatMsg, correction);
        }

        if (correctedText) {
            if (config.useEmbed === true) {
                if (correctedText.length >= 2000) {
                    const moderationStartIndex = correctedText.indexOf("[Moderation Commands]");
                    const optionalFeaturesStartIndex = correctedText.indexOf("[Optional Features]");
                    const toolsUtilitiesStartIndex = correctedText.indexOf("[Tools and Utilites]");

                    const moderationEndIndex = optionalFeaturesStartIndex !== -1 ? optionalFeaturesStartIndex : toolsUtilitiesStartIndex;
                    const optionalFeaturesEndIndex = toolsUtilitiesStartIndex !== -1 ? toolsUtilitiesStartIndex : correctedText.length;

                    const moderationMessage = correctedText.substring(moderationStartIndex, moderationEndIndex).trim();
                    const optionalFeaturesMessage = correctedText.substring(optionalFeaturesStartIndex, optionalFeaturesEndIndex).trim();
                    const toolsUtilitiesMessage = correctedText.substring(toolsUtilitiesStartIndex).trim();

                    const messages = [moderationMessage, optionalFeaturesMessage, toolsUtilitiesMessage];

                    messages.forEach((msg) => {
                        const embed = new EmbedBuilder()
                            .setColor(config.setColor)
                            .setTitle(config.setTitle)
                            .setDescription("[In Game] " + msg)
                            .setAuthor({ name: "‎", iconURL: "https://i.imgur.com/FA3I1uu.png" })
                            .setThumbnail(thumbUrl);

                        if (typeof channelId === "object") {
                            channelId.send({ embeds: [embed] });
                        } else {
                            console.log("I could not find the channel for the paradoxLogs Channel in Discord.");
                        }
                    });

                    return;
                }
                //Icons for certian messages.
                switch (true) {
                    case correctedText.includes("has banned"):
                        thumbUrl = "https://i.imgur.com/F18zcLY.png";
                        break;
                    case correctedText.includes("has been unbanned."):
                        thumbUrl = "https://i.imgur.com/0MNCVoM.png";
                        break;
                    case correctedText.includes("Nuker/A"):
                        thumbUrl = "https://i.imgur.com/oClQXNb.png";
                        break;
                    case correctedText.includes("Scaffold/A"):
                        thumbUrl = "https://i.imgur.com/oClQXNb.png";
                        break;
                    case correctedText.includes("KillAura/A"):
                        thumbUrl = "https://i.imgur.com/oClQXNb.png";
                        break;
                    default:
                        //expects undefined or null if no url is provided.
                        thumbUrl = null;
                        break;
                }

                const embed = new EmbedBuilder()
                    .setColor(config.setColor)
                    .setTitle(config.setTitle)
                    .setDescription("[In Game] " + correctedText)
                    .setAuthor({ name: "‎", iconURL: "https://i.imgur.com/FA3I1uu.png" })
                    .setThumbnail(thumbUrl);

                sendToChannel(channelId, { embeds: [embed] }, "I could not find the in-game channel in Discord. 2");
            } else {
                let msg: string = `[In Game] Paradox: ${antiCheatMsg}`;
                sendToChannel(channelId, msg, "I could not find the in-game channel in Discord. 3");
            }
        }
    });
    function sendToChannel(channelId: TextBasedChannel, content: string | MessagePayload | MessageCreateOptions, errorMessage: string) {
        if (typeof channelId === "object") {
            channelId.send(content);
        } else {
            console.log(errorMessage);
        }
    }
}
