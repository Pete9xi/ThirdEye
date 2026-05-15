import { createClient, ClientOptions, Client } from "bedrock-protocol";
import config from "../config.js";
import { registerBedrockListeners } from "./bedrock_packet_listeners.js";
import { registerAccountLinkListener } from "./account_link_listener.js";
import chalk from "chalk";
import { bindAllListeners } from "../discord/bedrock_listener_manager.js";

let bedrockClient: Client;
let reconnecting = false;
let intSync: boolean;

export function initBedrock(): Client {
    const client = createNewClient();
    bedrockClient = client;
    intSync = true;
    return client;
}

// ─────────────────────────────────────────────
// Client factory
// ─────────────────────────────────────────────
function createNewClient(): Client {
    let options: ClientOptions;

    if (config.isRealm) {
        options = {
            username: config.username,
            profilesFolder: "authentication_tokens",
            realms: { realmInvite: config.realmInviteCode },
        } as unknown as ClientOptions;
    } else {
        options = {
            host: config.ip,
            port: config.port,
            username: config.username,
            offline: config.AuthType,
            profilesFolder: "authentication_tokens",
        };
    }

    const client = createClient(options);

    registerBedrockListeners(client);
    registerAccountLinkListener(client);

    return client;
}

// ─────────────────────────────────────────────
// Reconnect system
// ─────────────────────────────────────────────
export function reconnectBedrock() {
    if (reconnecting) return;
    reconnecting = true;

    console.log(chalk.cyan("[BEDROCK] Reconnecting in 5 seconds..."));

    setTimeout(() => {
        console.log(chalk.cyan("[BEDROCK] Reconnecting now..."));

        const client = createNewClient();

        let handled = false;

        const retry = (err?: any) => {
            if (handled) return;
            handled = true;

            if (err?.name === "RakTimeout") {
                console.log(chalk.yellow("[BEDROCK] Ping timeout, retrying..."));
            } else if (err) {
                console.log(chalk.red("[BEDROCK] Reconnect failed:"), err);
            }

            reconnecting = false;
            intSync = true;
            reconnectBedrock();
        };

        client.once("spawn", () => {
            handled = true;

            console.log(chalk.green("[BEDROCK] Reconnected successfully"));

            bedrockClient = client;
            bindAllListeners(bedrockClient);

            reconnecting = false;
        });

        client.once("error", retry);
        client.once("close", retry);
    }, 5000);
}

// ─────────────────────────────────────────────
// Shared commands
// ─────────────────────────────────────────────
export function runCMD(cmd: string) {
    bedrockClient.queue("command_request", {
        command: cmd,
        origin: {
            type: "player",
            uuid: "",
            request_id: "",
            player_entity_id: [0, 0],
        },
        internal: false,
        version: "latest",
    });
}

export function runText(message: string) {
    bedrockClient.queue("text", {
        needs_translation: false,
        category: "authored",
        chat: "chat",
        whisper: "whisper",
        announcement: "announcement",
        type: "chat",
        source_name: config.username,
        message: message,
        xuid: "",
        platform_chat_id: "",
        has_filtered_message: false,
    });
}

export function getBedrockClient(): Client {
    return bedrockClient;
}
export function setIntSync(bool: boolean) {
    intSync = bool;
}
export function getIntSync(): boolean {
    return intSync;
}
