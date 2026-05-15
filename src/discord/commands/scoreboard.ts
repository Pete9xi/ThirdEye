import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { formatTime, getAllPlayerSessions } from "../../stores/player_sessions.js";
import { isExcluded } from "../../stores/excludedPlayers.js";

export default {
    data: new SlashCommandBuilder().setName("top").setDescription("View the top players by playtime"),

    async execute(interaction: ChatInputCommandInteraction) {
        const players = getAllPlayerSessions();

        const sorted = Object.entries(players)
            .filter(([uuid, data]) => {
                // exclude by UUID OR username
                return !isExcluded(uuid) && !isExcluded(data.username ?? "");
            })
            .sort(([, a], [, b]) => b.totalPlayTime - a.totalPlayTime)
            .slice(0, 10);

        if (sorted.length === 0) {
            return interaction.reply("❌ No valid player data available.");
        }

        const leaderboard = sorted
            .map(([uuid, data], index) => {
                const name = data.username ?? uuid;

                return `**#${index + 1}** ${name} — ${formatTime(data.totalPlayTime)}`;
            })
            .join("\n");

        return interaction.reply({
            content: `🏆 **Top Players**\n\n${leaderboard}`,
        });
    },
};
