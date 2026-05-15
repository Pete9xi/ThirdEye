import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { formatDate, getPlayerSessionByUsername } from "../../stores/player_sessions.js";

export default {
    data: new SlashCommandBuilder()
        .setName("firstjoin")
        .setDescription("Check when a player first joined the Minecraft server.")
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

        const firstJoin = formatDate(data.firstJoin);

        return interaction.reply({
            content: `📅 **${data.username ?? player}** first joined on **${firstJoin}**`,
        });
    },
};
