import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, MessageFlags } from "discord.js";

import config from "../../config.js";
import { runText } from "../../bedrock/bedrock.js";

export default {
    data: new SlashCommandBuilder()
        .setName("anticheatcommand")
        .setDescription("Execute an anticheat command.")
        .addStringOption((option) => option.setName("command").setDescription("The command to execute").setRequired(true)),

    async execute(interaction: ChatInputCommandInteraction) {
        const allowedRole = config.operatorsRole;
        const member = interaction.member as GuildMember;

        if (!member.roles.cache.some((role) => role.name === allowedRole)) {
            return interaction.reply({ content: "⛔ You do not have permission to use this command.", flags: MessageFlags.Ephemeral });
        }

        const command = interaction.options.getString("command", true);
        runText(command);

        return interaction.reply(`✅ Executing command: **${command}**`);
    },
};
