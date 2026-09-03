import chalk from "chalk";
import fs from "fs";
import path from "path";
import { initBedrock } from "./bedrock/bedrock.js";
import { initDiscord } from "./discord/discord.js";

/**
 * Resolves path relative to the current working directory where the script was executed.
 * @param {string} fileName - Target relative file name.
 * @returns {string} Absolute path relative to process execution directory.
 */
function getExecutionPath(fileName: string): string {
    return path.resolve(process.cwd(), fileName);
}

/**
 * Loads whitelist JSON file safely relative to execution path into an O(1) Set.
 * @returns {Set<string>} Whitelist items set or empty set if missing/invalid.
 */
function loadWhitelist(): Set<string> {
    const filePath = getExecutionPath("whitelist.json");

    if (!fs.existsSync(filePath)) {
        console.log(chalk.yellow(`[WHITELIST] Warning: ${filePath} not found. Operating with empty whitelist.`));
        return new Set();
    }

    try {
        const rawContent = fs.readFileSync(filePath, "utf-8");
        const parsed: string[] = JSON.parse(rawContent);
        return new Set(parsed);
    } catch (err) {
        console.log(chalk.red(`[WHITELIST] Failed to parse ${filePath}: ${err}`));
        return new Set();
    }
}

/**
 * Main application bootstrap runner.
 */
async function main(): Promise<void> {
    console.log(chalk.yellow("ThirdEye v2.0.0 Starting..."));

    const whitelist = loadWhitelist();

    console.log(chalk.cyan("Initializing Bedrock client..."));
    const bedrockClient = initBedrock();

    console.log(chalk.cyan("Initializing Discord client..."));
    await initDiscord(bedrockClient, Array.from(whitelist));
}

await main();
