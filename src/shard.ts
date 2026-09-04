import { fileURLToPath } from "node:url";
import { ShardingManager } from "discord.js";
import config from "./config.js";

/**
 * Resolves the target script file path relative to the current module location.
 * Uses URL resolution for direct path calculation in ES Modules.
 */
const scriptPath = fileURLToPath(new URL("./index.js", import.meta.url));

const manager = new ShardingManager(scriptPath, {
    token: config.token,
    totalShards: "auto",
});

manager.on("shardCreate", (shard) => {
    console.log(`🧩 Shard ${shard.id} launched`);
});

manager.spawn();
