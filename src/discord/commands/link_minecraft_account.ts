import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { deletePendingLink, setPendingLink } from "../../stores/pendingLinks.js";

export default {
    data: new SlashCommandBuilder().setName("link_minecraft_account").setDescription("Link your Minecraft account"),

    async execute(interaction: ChatInputCommandInteraction) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        setPendingLink(code, interaction.user.id);

        await interaction.reply({
            content: `Your linking code is: **${code}**\nRun \`/link ${code}\` in Minecraft. This code will expire in 5 minutes.`,
            flags: MessageFlags.Ephemeral,
        });

        // Optional: expire after 5 mins
        setTimeout(() => deletePendingLink(code), 5 * 60 * 1000);
    },
};
