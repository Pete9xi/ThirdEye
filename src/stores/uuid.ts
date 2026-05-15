import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve("./data");
const UUID_FILE = path.join(DATA_DIR, "onlineUUIDs.json");

type UUIDEntry = {
    username: string;
    lastSeen: number;
};

let onlineUUIDs: Record<string, UUIDEntry> = {};

// Ensure folder exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load file
if (fs.existsSync(UUID_FILE)) {
    onlineUUIDs = JSON.parse(fs.readFileSync(UUID_FILE, "utf8"));
}

// Save helper
function save() {
    fs.writeFileSync(UUID_FILE, JSON.stringify(onlineUUIDs, null, 2));
}

// --- EXPORTED FUNCTIONS ---

export function addUUID(uuid: string, username: string) {
    onlineUUIDs[uuid] = {
        username,
        lastSeen: Date.now(),
    };
    save();
}

export function removeUUID(uuid: string) {
    delete onlineUUIDs[uuid];
    save();
}

export function hasUUID(uuid: string): boolean {
    return !!onlineUUIDs[uuid];
}

export function getAllUUIDs() {
    return onlineUUIDs;
}

export function updateLastSeen(uuid: string) {
    if (onlineUUIDs[uuid]) {
        onlineUUIDs[uuid].lastSeen = Date.now();
        save();
    }
}
export function getUsername(uuid: string): string | undefined {
    return onlineUUIDs[uuid]?.username;
}

export function getUUIDByUsername(username: string): string | undefined {
    return Object.entries(onlineUUIDs).find(([_, data]) => data.username === username)?.[0];
}
