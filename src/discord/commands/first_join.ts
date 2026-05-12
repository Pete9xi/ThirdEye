import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { formatDate, getPlayerSession } from "../../stores/player_sessions.js";

export default {
    data: new SlashCommandBuilder()
        .setName("firstjoin")
        .setDescription("Check when a player first joined the Minecraft server.")
        .addStringOption((option) => option.setName("player").setDescription("Player name").setRequired(false)),

    async execute(interaction: ChatInputCommandInteraction) {
        const player = interaction.options.getString("player") || interaction.user.username;

        const data = getPlayerSession(player);

        if (!data) {
            return interaction.reply({
                content: `❌ No data found for **${player}**`,
                flags: MessageFlags.Ephemeral,
            });
        }

        const firstJoin = formatDate(data.firstJoin);

        return interaction.reply({
            content: `📅 **${player}** first joined on **${firstJoin}**`,
        });
    },
};
