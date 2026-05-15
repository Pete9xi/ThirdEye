import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { formatTime, getPlayerSessionByUsername } from "../../stores/player_sessions.js";

export default {
    data: new SlashCommandBuilder()
        .setName("playtime")
        .setDescription("Check playtime on the Minecraft server.")
        .addStringOption((option) => option.setName("player").setDescription("Player name").setRequired(true)),

    async execute(interaction: ChatInputCommandInteraction) {
        const player = interaction.options.getString("player", true);

        const data = getPlayerSessionByUsername(player);

        if (!data) {
            return interaction.reply({
                content: `❌ No data found for **${player}**`,
                flags: MessageFlags.Ephemeral,
            });
        }

        const playtime = formatTime(data.totalPlayTime);

        return interaction.reply({
            content: `🕒 **${player}** has played for **${playtime}**`,
        });
    },
};
