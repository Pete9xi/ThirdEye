import { ShardingManager } from "discord.js";
import config from "./config.js";

const manager = new ShardingManager("./index.js", {
    token: config.token,
    totalShards: "auto",
});

manager.on("shardCreate", (shard) => {
    console.log(`🧩 Shard ${shard.id} launched`);
});

manager.spawn();
