import { Client } from "bedrock-protocol";
import chalk from "chalk";
import config from "../config.js";
import { getIntSync, reconnectBedrock, setIntSync } from "./bedrock.js";
import { onPlayerAdd, onPlayerRemove, reconcileFullSnapshot } from "../stores/player_sessions.js";
let clientPermissionLevel: string;
let clientGamemode: string;
const initialPlayers = new Map<string, string>();
let initialSyncTimer: NodeJS.Timeout | null = null;

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

        console.log(`[PLAYER_LIST] count=${packet.records.length}`);

        // =========================================
        // INITIAL SYNC
        // =========================================
        if (getIntSync()) {
            for (const record of packet.records) {
                console.log(`[PLAYER_LIST] ${record.type} ${record.uuid} -> ${record.username}`);

                if (record.type === "add") {
                    initialPlayers.set(record.uuid, record.username);
                }
            }

            console.log(`[INITIAL SYNC] Collected ${initialPlayers.size} player(s)`);

            // More player_list packets may still be coming.
            // Reset the timer whenever another one arrives.
            if (initialSyncTimer !== null) {
                clearTimeout(initialSyncTimer);
            }

            initialSyncTimer = setTimeout(() => {
                const syncNow = Date.now();
                const playerCount = initialPlayers.size;

                console.log(`🔄 Running initial player sync... ${playerCount} players found`);

                for (const [uuid, username] of initialPlayers) {
                    console.log(`[INITIAL SYNC] calling onPlayerAdd: ${username} ${uuid}`);

                    onPlayerAdd(uuid, syncNow, username);
                }

                reconcileFullSnapshot(new Set(initialPlayers.keys()), syncNow);

                // Clear temporary sync state.
                initialPlayers.clear();
                initialSyncTimer = null;

                // Initial sync is now complete.
                setIntSync(false);

                console.log(`[INITIAL SYNC] Complete - ${playerCount} players`);
            }, 500);

            return;
        }

        // =========================================
        // LIVE MODE
        // =========================================
        for (const record of packet.records) {
            if (record.type === "add") {
                onPlayerAdd(record.uuid, now, record.username);

                continue;
            }

            if (record.type === "remove") {
                onPlayerRemove(record.uuid, now);
            }
        }
    });
}
