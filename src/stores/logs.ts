import fs from "fs";
import path from "path";

const LOG_FILE = path.join("./data", "player_list_packets.log");

export function logPacket(packet: any) {
    const safe = JSON.stringify(packet, (_, value) => (typeof value === "bigint" ? value.toString() : value), 2);

    fs.appendFileSync(LOG_FILE, `\n\n=== player_list @ ${new Date().toISOString()} ===\n${safe}\n`);
}
