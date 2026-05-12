import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, MessageFlags } from "discord.js";
import { existsSync, readFileSync, writeFileSync } from "fs";

export default {
    data: new SlashCommandBuilder()
        .setName("removestreamer")
        .setDescription("Remove a Minecraft username from the streamer exclusion list")
        .addStringOption((option) => option.setName("username").setDescription("Minecraft username").setRequired(true)),

    async execute(interaction: ChatInputCommandInteraction) {
        const allowedRole = "Content Creators";
        const member = interaction.member as GuildMember;

        if (!member.roles.cache.some((role) => role.name === allowedRole)) {
            return interaction.reply({ content: "⛔ You do not have permission to use this command.", flags: MessageFlags.Ephemeral });
        }

        const mcUsername = interaction.options.getString("username", true);

        if (!existsSync("streaming.json")) {
            writeFileSync("streaming.json", JSON.stringify([], null, 2));
        }

        let streamingList: string[] = JSON.parse(readFileSync("streaming.json", "utf8"));

        if (streamingList.includes(mcUsername)) {
            streamingList = streamingList.filter((name) => name !== mcUsername);
            writeFileSync("streaming.json", JSON.stringify(streamingList, null, 2));

            return interaction.reply(`❌ Removed **${mcUsername}** from the streamer exclusion list.`);
        } else {
            return interaction.reply(`⚠️ **${mcUsername}** is not in the list.`);
        }
    },
};
