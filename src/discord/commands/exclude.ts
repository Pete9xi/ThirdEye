import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, MessageFlags } from "discord.js";

import { addExcluded, removeExcluded, getExcludedPlayers } from "../../stores/excludedPlayers.js";
import config from "../../config.js";

export default {
    data: new SlashCommandBuilder()
        .setName("exclude")
        .setDescription("Manage leaderboard exclusions")
        .addSubcommand((sub) =>
            sub
                .setName("add")
                .setDescription("Exclude a player")
                .addStringOption((opt) => opt.setName("player").setDescription("Player name").setRequired(true))
        )
        .addSubcommand((sub) =>
            sub
                .setName("remove")
                .setDescription("Remove exclusion")
                .addStringOption((opt) => opt.setName("player").setDescription("Player name").setRequired(true))
        )
        .addSubcommand((sub) => sub.setName("list").setDescription("List excluded players")),

    async execute(interaction: ChatInputCommandInteraction) {
        const allowedRole = config.operatorsRole;
        const member = interaction.member as GuildMember;

        if (!member.roles.cache.some((role) => role.name === allowedRole)) {
            return interaction.reply({ content: "⛔ You do not have permission to use this command.", flags: MessageFlags.Ephemeral });
        }
        const sub = interaction.options.getSubcommand();

        if (sub === "add") {
            const player = interaction.options.getString("player", true);

            const ok = addExcluded(player);

            return interaction.reply(ok ? `🚫 Excluded **${player}**` : `⚠️ **${player}** is already excluded`);
        }

        if (sub === "remove") {
            const player = interaction.options.getString("player", true);

            const ok = removeExcluded(player);

            return interaction.reply(ok ? `✅ Removed **${player}** from exclusions` : `⚠️ **${player}** was not excluded`);
        }

        if (sub === "list") {
            const list = getExcludedPlayers();

            return interaction.reply(list.length ? `🚫 **Excluded Players:**\n${list.map((p) => `• ${p}`).join("\n")}` : "No excluded players");
        }
        return interaction.reply("❌ Invalid subcommand.");
    },
};
