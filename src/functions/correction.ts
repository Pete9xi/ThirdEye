/**
 * Mapping of Minecraft formatted text → clean replacements.
 *
 * This is primarily used to:
 *  - Strip Minecraft "§" color & formatting codes
 *  - Normalize AntiCheat / plugin prefixes (Paradox, Scythe)
 *  - Prevent unreadable or spammy messages in Discord logs
 *
 * Each key is an EXACT string match.
 * Each value is what the matched text will be replaced with.
 */
export const correction = {
    // ─────────────────────────────────────────────
    // AntiCheat / Plugin prefix normalization
    // ─────────────────────────────────────────────

    // Paradox prefix variations → "Paradox"
    "§2[§7Paradox§2]§o§7": "Paradox",
    "§2[§7Member§2]": "Member",
    // ─────────────────────────────────────────────
    // Minecraft formatting code stripping
    // ─────────────────────────────────────────────
    // These remove color, style, and reset codes from chat
    "§l": "", // bold
    "§o": "", // italic
    "§k": "", // obfuscated
    "§r": "", // reset

    // Color codes
    "§0": "",
    "§1": "",
    "§2": "",
    "§3": "",
    "§4": "",
    "§5": "",
    "§6": "",
    "§7": "",
    "§8": "",
    "§9": "",
    "§a": "",
    "§b": "",
    "§c": "",
    "§d": "",
    "§e": "",
    "§f": "",
    "§g": "",
    "§h": "",
    "§i": "",
    "§j": "",
    "§m": "",
    "§n": "",
    "§p": "",
    "§q": "",
    "§s": "",
    "§t": "",
    "§u": "",

    //Custom
    "": "[Console] ",
    "": "[PC] ",
    "": "[Mobile] ",

    // Rare / malformed formatting character
    "§¶": "",
};

/**
 * Applies all text corrections to a Minecraft chat string.
 *
 * This function:
 *  1. Builds a single RegExp from all correction keys
 *  2. Replaces every match in one pass (efficient)
 *
 * @param text - Raw chat text received from Minecraft
 * @param correction - Replacement map of formatted strings → clean text
 * @returns Cleaned and readable chat text
 */
export function autoCorrect(text: string, correction: { [key: string]: string }): string {
    /**
     * Create a global RegExp that matches ANY key in the correction object.
     *
     * Example:
     *   §l|§r|§4|§r§4[§6Paradox§4]§r|...
     *
     * The "g" flag ensures all matches are replaced.
     */
    const reg = new RegExp(Object.keys(correction).join("|"), "g");

    /**
     * Replace each matched formatting string with its mapped value.
     */
    return text.replace(reg, (matched) => {
        return correction[matched as keyof typeof correction];
    });
}
