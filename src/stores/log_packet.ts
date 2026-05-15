import fs from "fs";
import path from "path";

const LOG_FILE = path.join("./data", "packets.log");

export function logPacket(packet: any) {
    const safe = JSON.stringify(packet, (_, value) => (typeof value === "bigint" ? value.toString() : value), 2);

    fs.appendFileSync(LOG_FILE, `\n\n=== packet @ ${new Date().toISOString()} ===\n${safe}\n`);
}
