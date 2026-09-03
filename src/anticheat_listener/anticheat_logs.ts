import { MessageCreateOptions, MessagePayload, TextChannel } from "discord.js";
import config from "../config.js";
import { autoCorrect, correction } from "../functions/correction.js";
import { Client } from "bedrock-protocol";
import { createEmbed } from "../functions/embedBuilder.js";
import chalk from "chalk";
let thumbUrl: string | undefined;
export function setupAntiCheatListener(bedrockClient: Client, channelId: TextChannel) {
    console.log(chalk.cyan("AntiCheat Listener initialized."));
    bedrockClient.on("text", (packet: WhisperPacket | ChatPacket) => {
        const message = packet.message;

        const isAntiCheatMessage = message.includes("§2[§7Available Commands§2]§r") || message.includes("§2[§7Paradox§2]§o§7");

        if (!isAntiCheatMessage) {
            return;
        }
        const obj = JSON.parse(message);
        const rawText = obj.rawtext[0]?.text || "";
        let antiCheatMsg;
        let correctedText;
        if (rawText.includes("§2[§7Available Commands§2]§r") || rawText.includes("§2[§7Paradox§2]§o§7")) {
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
                        const embed = createEmbed({
                            title: config.setTitle,
                            description: "[In Game] " + msg,
                            color: config.setColor,
                            author: { name: "‎", iconURL: config.logoURL },
                            thumbnailUrl: thumbUrl,
                        });

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
                        // Expects undefined if no URL is provided.
                        thumbUrl = undefined;
                        break;
                }

                const embed = createEmbed({
                    title: config.setTitle,
                    description: "[In Game] " + correctedText,
                    color: config.setColor,
                    author: { name: "‎", iconURL: config.logoURL },
                    thumbnailUrl: thumbUrl,
                });

                sendToChannel(channelId, { embeds: [embed] }, "I could not find the in-game channel in Discord. 2");
            } else {
                let msg: string = `[In Game] Paradox: ${antiCheatMsg}`;
                sendToChannel(channelId, msg, "I could not find the in-game channel in Discord. 3");
            }
        }
    });
    function sendToChannel(channelId: TextChannel, content: string | MessagePayload | MessageCreateOptions, errorMessage: string) {
        if (typeof channelId === "object") {
            channelId.send(content);
        } else {
            console.log(errorMessage);
        }
    }
}
