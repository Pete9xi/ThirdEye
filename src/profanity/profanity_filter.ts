import chalk from "chalk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// O(1) Whitelist set preventing false positives
const WHITELIST_SET = new Set(["class", "pass", "assistant"]);

/**
 * Normalizes raw string input into a unique, sorted array of words.
 * @param {string} raw - File text contents.
 * @returns {string[]} Filtered array of normalized words sorted by length.
 */
function parseWordList(raw: string): string[] {
    const words = raw
        .split(/\r?\n/)
        .map((w) =>
            w
                .replace(/\uFEFF/g, "")
                .trim()
                .toLowerCase()
        )
        .filter((w) => w.length > 1);

    return Array.from(new Set(words)).sort((a, b) => b.length - a.length);
}

/**
 * Safely loads profanity list from disk relative to execution directory.
 * Returns an empty array if the file does not exist.
 * @returns {string[]} Parsed profanity word list.
 */
function loadProfanityFile(): string[] {
    const filePath = path.join(path.dirname(fileURLToPath(import.meta.url)), "profanity.txt");

    if (!fs.existsSync(filePath)) {
        console.log(chalk.yellow(`[PROFANITY] File not found: ${filePath}. Continuing with empty list.`));
        return [];
    }

    try {
        const raw = fs.readFileSync(filePath, "utf-8");
        return parseWordList(raw);
    } catch (err) {
        console.log(chalk.red(`[PROFANITY] Failed to read ${filePath}: ${err}`));
        return [];
    }
}

/**
 * Escapes special characters for regex string interpolation.
 * @param {string} str - Unescaped raw string.
 * @returns {string} Escaped regex string.
 */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Compiles a RegExp matcher pattern or returns null if the word list is empty.
 * @param {string[]} wordList - Array of target words.
 * @param {boolean} useBoundaries - Wrap pattern with word boundaries.
 * @returns {RegExp | null} Compiled RegExp or null.
 */
function compileRegex(wordList: string[], useBoundaries: boolean): RegExp | null {
    if (wordList.length === 0) return null;
    const pattern = wordList.map(escapeRegex).join("|");
    return new RegExp(useBoundaries ? `\\b(${pattern})\\b` : pattern, "gi");
}

/**
 * Evaluates whether a matched word is whitelisted in O(1) time complexity.
 * @param {string} match - Detected string match.
 * @returns {boolean} True if term is whitelisted.
 */
function isWhitelisted(match: string): boolean {
    return WHITELIST_SET.has(match.toLowerCase());
}

/**
 * Applies regex censoring replacement rules on input message text.
 * @param {string} text - Message text to sanitize.
 * @param {RegExp | null} regex - Pattern engine to apply.
 * @param {Set<string>} detectedSet - O(1) tracking set for profane matches.
 * @returns {string} Processed text output.
 */
function applyCensorship(text: string, regex: RegExp | null, detectedSet: Set<string>): string {
    if (!regex) return text;

    return text.replace(regex, (match) => {
        if (isWhitelisted(match)) {
            return match;
        }
        detectedSet.add(match);
        return "*".repeat(match.length);
    });
}

/**
 * Outputs detection logs to stdout.
 * @param {Set<string>} detectedSet - Set of detected unique words.
 * @param {string} message - Original raw input string.
 */
function logResult(detectedSet: Set<string>, message: string): void {
    if (detectedSet.size > 0) {
        const uniqueMatches = Array.from(detectedSet).join(", ");
        console.log(chalk.red(`[PROFANITY DETECTED] Words: [${uniqueMatches}] | Message: "${message}"`));
    } else {
        console.log(chalk.gray(`[CLEAN] ${message}`));
    }
}

// Global cached pre-compiled regex engine setup
const uniqueWords = loadProfanityFile();
const normalWords = uniqueWords.filter((w) => /^[a-z]+$/.test(w));
const specialWords = uniqueWords.filter((w) => !/^[a-z]+$/.test(w));

const normalRegex = compileRegex(normalWords, true);
const specialRegex = compileRegex(specialWords, false);

/**
 * Replaces matching profane words in a text string with asterisks.
 * @param {string} message - Input string message.
 * @returns {string} Filtered message.
 */
export function censorMessage(message: string): string {
    if (!message) return message;

    const detectedSet = new Set<string>();

    let result = applyCensorship(message, normalRegex, detectedSet);
    result = applyCensorship(result, specialRegex, detectedSet);

    logResult(detectedSet, message);

    return result;
}
