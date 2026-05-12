import chalk from "chalk";
import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve("./data");
const EXCLUDE_FILE = path.join(DATA_DIR, "excludedPlayers.json");

//
// TYPES
//
type ExcludedPlayer = string;

//
// STATE
//
let excludedPlayers: ExcludedPlayer[] = [];

//
// ENSURE DATA DIR EXISTS
//
if (!fs.existsSync(DATA_DIR)) {
    console.log(chalk.yellow(`Creating data directory at ${DATA_DIR}`));
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

//
// ENSURE FILE EXISTS
//
if (!fs.existsSync(EXCLUDE_FILE)) {
    console.log(chalk.yellow(`Creating excludedPlayers.json`));
    fs.writeFileSync(EXCLUDE_FILE, JSON.stringify([], null, 2));
}

//
// SAFE LOAD
//
try {
    const raw = fs.readFileSync(EXCLUDE_FILE, "utf8");
    const parsed = JSON.parse(raw);

    excludedPlayers = Array.isArray(parsed) ? parsed : [];
} catch {
    console.log(chalk.red("Corrupted excludedPlayers.json — resetting"));
    excludedPlayers = [];
    fs.writeFileSync(EXCLUDE_FILE, JSON.stringify([], null, 2));
}

//
// SAVE
//
function saveExcluded() {
    fs.writeFileSync(EXCLUDE_FILE, JSON.stringify(excludedPlayers, null, 2));
}

//
// GETTERS
//
export function getExcludedPlayers() {
    return excludedPlayers;
}

export function isExcluded(playerID: string) {
    return excludedPlayers.includes(playerID);
}

//
// ADD
//
export function addExcluded(playerID: string) {
    if (!excludedPlayers.includes(playerID)) {
        excludedPlayers.push(playerID);
        saveExcluded();
        return true;
    }
    return false;
}

//
// REMOVE
//
export function removeExcluded(playerID: string) {
    const before = excludedPlayers.length;
    excludedPlayers = excludedPlayers.filter((p) => p !== playerID);

    if (excludedPlayers.length !== before) {
        saveExcluded();
        return true;
    }

    return false;
}
