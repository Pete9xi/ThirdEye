import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { formatDateTime, getPlayerSessionByUsername } from "../../stores/player_sessions.js";

export default {
    data: new SlashCommandBuilder()
        .setName("seen")
        .setDescription("Check when a player was last seen on the Minecraft server.")
        .addStringOption((option) => option.setName("player").setDescription("Player name").setRequired(false)),

    async execute(interaction: ChatInputCommandInteraction) {
        const player = interaction.options.getString("player") || interaction.user.username;

        const data = getPlayerSessionByUsername(player);

        if (!data) {
            return interaction.reply({
                content: `❌ No data found for **${player}**`,
                ephemeral: true,
            });
        }

        const lastSeen = formatDateTime(data.lastSeen);

        return interaction.reply({
            content: `👀 **${player}** was last seen at **${lastSeen}**`,
        });
    },
};
