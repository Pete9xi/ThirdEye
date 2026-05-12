import { Client } from "bedrock-protocol";
import chalk from "chalk";
import config from "../config.js";
import { reconnectBedrock } from "./bedrock.js";

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
}
