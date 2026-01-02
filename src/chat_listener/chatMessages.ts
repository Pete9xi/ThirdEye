import { EmbedBuilder, TextChannel } from "discord.js";
import { Client } from "bedrock-protocol";
import config from "../config.js";
import { autoCorrect, correction } from "../functions/correction.js";

export function setupChatMessageListener(bot: Client, channelId: TextChannel) {
    bot.on("text", (packet: JsonPacket | ChatPacket) => {
        if (!channelId || typeof channelId !== "object") {
            console.log("chatMessage: I could not find the in-game channel in Discord.");
            return;
        }

        // ─────────────────────────────────────────────
        // JSON chat packets (Paradox / Scythe)
        // ─────────────────────────────────────────────
        if (packet.type === "json") {
            const obj = JSON.parse(packet.message);
            const text = obj?.rawtext?.[0]?.text;

            // Ignore invalid / command / empty / Discord loop messages
            if (!text || obj.rawtext?.[0]?.translate || text.includes("Discord")) {
                return;
            }

            // Known AntiCheat / help / command messages to ignore
            const ignoredPrefixes = [
                "§r§4[§6Paradox§4]§r",
                "§r§6[§aScythe§6]§r",
                "§l§6[§4Paradox§6]§r",
                "§l§6[§4Paradox AntiCheat Command Help§6]",
                "§f§o§4[§6Paradox§4]§f§o",
                "§f§4[§6Paradox§4]§f",
                "§2[§7Available Commands§2]§r",
                "§2[§7Paradox§2]§o§7",
                "§l§o§6[§4Paradox AntiCheat Command Help§6]§r§o",
            ];

            if (ignoredPrefixes.some((prefix) => text.includes(prefix))) {
                return;
            }

            sendToDiscord(channelId, `[In Game] ${autoCorrect(text, correction)}`);
            return;
        }

        // ─────────────────────────────────────────────
        // Normal chat packets
        // ─────────────────────────────────────────────
        if (packet.type === "chat") {
            sendToDiscord(channelId, `[In Game] **${packet.source_name}**: ${packet.message}`);
        }
    });
}

// ─────────────────────────────────────────────
// Helper: Send message or embed
// ─────────────────────────────────────────────
function sendToDiscord(channelId: TextChannel, content: string) {
    if (!config.useEmbed) {
        return channelId.send(content);
    }

    const embed = new EmbedBuilder().setColor(config.setColor).setTitle(config.setTitle).setDescription(content).setAuthor({ name: "‎", iconURL: config.logoURL });

    return channelId.send({ embeds: [embed] });
}
