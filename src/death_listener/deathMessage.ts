import { EmbedBuilder, TextChannel } from "discord.js";
import config from "../config.js";
import { Client } from "bedrock-protocol";

export function setupDeathListener(bot: Client, channelId: TextChannel) {
    bot.on("text", (packet) => {
        if (packet.message.includes("death")) {
            let playername = packet.parameters[0];

            if (playername.includes("%entity")) {
                playername = "A tamed Animal";
            }

            const reason = getDeathReason(packet.message, packet.parameters[1]);

            sendDeathMessage(channelId, playername, reason);
        }
    });
}

function getDeathReason(message: string, parameter: string): string {
    const deathReasons: { [key: string]: string } = {
        "death.attack.mob": getMobDeathReason(parameter),
        "death.attack.arrow": "was killed by a Skeleton's Arrow.",
        "death.attack.indirectMagic": "was killed by indirect magic.",
        "death.attack.bullet": "was killed by a bullet.",
        "death.attack.inWall": "Suffocated to death!",
        "death.attack.explosion.player": "Was Blown to bits by an explosion",
        "death.attack.onFire": "Went up in flames!",
        "death.attack.player": "Was killed by " + parameter,
        "death.attack.inFire": "tried to take a bath in lava.",
        "death.attack.drown": parameter + " drowned to death!",
        "death.attack.outOfWorld": "Fell into the void.",
        "death.attack.sonicBoom.player": "Was blasted by the wardens sonic boom.",
        "death.fell.accident.generic": "Fell to their death.",
        "death.attack.fall": "Fell to their death.",
        "death.attack.player.item": "Was killed by " + parameter,
        "death.attack.lava": "Was playing with lava and died.",
        "death.attack.generic": "was killed by:" + parameter,
        "death.attack.flyIntoWall": "was killed by flying into the wall",
        "death.attack.wither": "was killed by a wither",
        "death.attack.trident": "was forked by a Drowned.",
        default: "General Death - " + message + " - " + parameter,
    };

    return deathReasons[message] || deathReasons.default;
}

function getMobDeathReason(entity: string): string {
    const mobDeathReasons: { [key: string]: string } = {
        "%entity.zombie.name": "was killed by a Zombie.",
        "%entity.skeleton.name": "was killed by a Skeleton's Arrow.",
        "%entity.spider.name": "was killed by a Spider.",
        "%entity.enderman.name": "was killed by an Enderman.",
        "%entity.zombie_pigman.name": "was killed by a Zombie Pigman.",
        "%entity.iron_golem.name": "was killed by an Iron Golem.",
        "%entity.piglin_brute.name": "was killed by a Piglin Brute.",
        "%entity.piglin.name": "was killed by a Piglin.",
        "%entity.wither_skeleton.name": "was killed by a Wither Skeleton.",
        "%entity.bee.name": "was chased by bees and got stung to death.",
        "%entity.magma_cube.name": "was killed by a Magma Cube.",
        "%entity.zoglin.name": "was killed by a Zoglin.",
        "%entity.blaze.name": "was killed by a Blaze.",
        "%entity.polar_bear.name": "was killed by a Polar Bear.",
        "%entity.wolf.name": "was killed by a pack of wolves.",
        "%entity.guardian.name": "was killed by a Guardian.",
        "%entity.elder_guardian.name": "was killed by an Elder Guardian.",
        "%entity.stray.name": "was killed by a Stray.",
        "%entity.husk.name": "was killed by a Husk.",
        "%entity.pillager.name": "was killed by a Pillager.",
        "%entity.vex.name": "was killed by a Vex.",
        "%entity.evocation_illager.name": "was killed by an Evoker's magic powers.",
        "%entity.vindicator.name": "was killed by a Vindicator.",
        "%entity.shulker.name": "was shot by a Shulker.",
        "%entity.ender_dragon.name": "was killed by the Ender Dragon.",
        "%entity.witch.name": "was killed by a Witch.",
        "%entity.warden.name": "got flattened by the Warden.",
        "%entity.drowned.name": "was killed by a Drowned",
        "%entity.breeze.name": "was blown away by a Breeze.",
        "%entity.ravager.name": "was run over by a Ravanger.",
        default: "was killed by a mob - " + entity,
    };

    return mobDeathReasons[entity] || mobDeathReasons.default;
}

function sendDeathMessage(channelId: TextChannel, playername: string, reason: string) {
    if (config.useEmbed === true) {
        const msgEmbed = new EmbedBuilder()
            .setColor(config.setColor)
            .setTitle(config.setTitle)
            .setDescription("[In Game] " + playername + ": " + reason)
            .setAuthor({ name: "‎", iconURL: config.logoURL });
        if (typeof channelId === "object") {
            channelId.send({ embeds: [msgEmbed] });
        } else {
            console.log("I could not find the in-game channel in Discord.");
        }
    } else {
        if (typeof channelId === "object") {
            channelId.send(`[In Game] **${playername}**: ${reason}`);
        } else {
            console.log("I could not find the in-game channel in Discord.");
        }
    }
}
