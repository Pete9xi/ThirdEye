import chalk from "chalk";
import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve("./data");
const FILE = path.join(DATA_DIR, "playerSessions.json");

type Session = {
    join: number;
    leave: number;
};

type PlayerSession = {
    discordId?: string;
    firstJoin: number;
    lastSeen: number;
    totalPlayTime: number;
    sessions: Session[];
    currentJoin?: number;
    lastSeenFromList?: number;
};

let playerSessions: Record<string, PlayerSession> = {};

if (!fs.existsSync(DATA_DIR)) {
    console.log(chalk.yellow(`Creating data directory at ${DATA_DIR}`));
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(FILE)) {
    console.log(chalk.yellow(`Creating playerSessions.json`));
    fs.writeFileSync(FILE, JSON.stringify({}, null, 2));
}

playerSessions = JSON.parse(fs.readFileSync(FILE, "utf8"));

function saveToFile() {
    fs.writeFileSync(FILE, JSON.stringify(playerSessions, null, 2));
}

//
// PLAYER JOIN
//
export function onPlayerJoin(playerID: string) {
    const now = Date.now();
    const player = playerSessions[playerID];

    // If they already had a session open → force close it safely
    if (player?.currentJoin) {
        const sessionTime = now - player.currentJoin;

        player.totalPlayTime += sessionTime;

        player.sessions.push({
            join: player.currentJoin,
            leave: now,
        });
    }

    if (!player) {
        playerSessions[playerID] = {
            firstJoin: now,
            lastSeen: now,
            totalPlayTime: 0,
            sessions: [],
            currentJoin: now,
        };
    } else {
        player.currentJoin = now;
        player.lastSeen = now;
    }

    console.log(`Player join: ${playerID}`);
    saveToFile();
}
//
// PLAYER LEAVE
//
export function onPlayerLeave(playerID: string) {
    const now = Date.now();
    const player = playerSessions[playerID];

    if (!player?.currentJoin) {
        console.log(`Leave ignored: ${playerID}`);
        return;
    }

    const sessionTime = now - player.currentJoin;

    player.totalPlayTime += sessionTime;

    player.sessions.push({
        join: player.currentJoin,
        leave: now,
    });

    delete player.currentJoin;

    player.lastSeen = now;

    console.log(`Player left: ${playerID}`);
    saveToFile();
}

//
// GET DATA
//
export function getPlayerSession(playerID: string) {
    return playerSessions[playerID];
}

export function getAllPlayerSessions() {
    return playerSessions;
}
//
// FORMAT TIME (ms → readable)
//
export function formatTime(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

//
// FORMAT DATE (dd/mm/yyyy)
//

export function formatDate(timestamp: number) {
    const date = new Date(timestamp);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

//
// FORMAT DATE + TIME
//
export function formatDateTime(timestamp: number) {
    const date = new Date(timestamp);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}
