import { Client } from "bedrock-protocol";
import chalk from "chalk";
import config from "../config.js";
import { getIntSync, reconnectBedrock, setIntSync } from "./bedrock.js";
import { onPlayerAdd, onPlayerRemove, reconcileFullSnapshot } from "../stores/player_sessions.js";
let clientPermissionLevel: string;
let clientGamemode: string;

export function registerBedrockListeners(bedrockClient: Client) {
    bedrockClient.on("packet_violation_warning", (packet) => {
        console.log(chalk.red(`Packet Violation Warning: ${packet}`));
    });

    bedrockClient.on("disconnect", (packet) => {
        console.log(chalk.red("Disconnected from server: " + JSON.stringify(packet, null, 2)));
        reconnectBedrock();
    });
    bedrockClient.on("spawn", (packet) => {
        console.log(chalk.green("Successfully connected to the server and spawned in as " + config.username));
    });
    bedrockClient.on("start_game", (packet: StartGame) => {
        clientPermissionLevel = packet.permission_level.toString();
        clientGamemode = packet.player_gamemode.toString();
        console.log(chalk.yellow(`Client Permission Level: ${clientPermissionLevel}, Client Gamemode: ${clientGamemode}`));
    });

    bedrockClient.on("text", (packet) => {
        if (config.debug) {
            console.log(chalk.blue(`Received text packet: ${JSON.stringify(packet, null, 2)}`));
        }
    });
    bedrockClient.on("close", (packet) => {
        console.log(chalk.red("The connection to the server was closed: " + JSON.stringify(packet, null, 2)));
        reconnectBedrock();
    });

    bedrockClient.on("player_list", (packet) => {
        const now = Date.now();
        const type = packet.records.type;

        const active = new Map<string, string>(); // uuid -> username

        for (const record of packet.records.records) {
            active.set(record.uuid, record.username);
        }

        // =========================
        // INITIAL SYNC (BOOT / RECONNECT)
        // =========================
        if (getIntSync()) {
            console.log("🔄 Running initial player sync...");

            // 1. mark all current players as active
            for (const [uuid, username] of active) {
                onPlayerAdd(uuid, now, username);
            }

            // 2. reconcile stale sessions from previous runtime
            reconcileFullSnapshot(new Set(active.keys()), now);

            // 3. mark sync complete
            setIntSync(false);
            return;
        }

        // =========================
        // LIVE MODE
        // =========================
        if (type === "add") {
            for (const [uuid, username] of active) {
                onPlayerAdd(uuid, now, username);
            }
        }

        if (type === "remove") {
            for (const record of packet.records.records) {
                onPlayerRemove(record.uuid, now);
            }
        }
    });
}
