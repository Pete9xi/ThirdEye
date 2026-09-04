/**
 * Generates a TypeScript type definition string dynamically from a runtime object.
 * Designed for inspecting dynamic protocol payloads like Bedrock packets.
 * 
 * @param {any} obj - The target object to inspect.
 * @param {string} [indent=""] - Internal indentation tracking string.
 * @param {Set<any>} [processed=new Set()] - Tracking set to prevent infinite loops on circular references.
 * @returns {string} The formatted TypeScript type definition string.
 */
export function generateTypeDefinition(
    obj: any, 
    indent = "", 
    processed = new Set<any>()
): string {
    if (obj === null || obj === undefined) return "null";
    if (typeof obj !== "object") return getType(obj);
    if (processed.has(obj)) return "Record<string, any>"; // Fallback for circular refs

    processed.add(obj);

    if (Array.isArray(obj)) {
        return handleArrayType(obj, indent, processed);
    }

    let typeDefinition = "{\n";
    const baseIndent = indent + "  ";

    for (const key of Object.keys(obj)) {
        const val = obj[key];
        const evaluatedType = (typeof val === "object" && val !== null)
            ? generateTypeDefinition(val, baseIndent, processed)
            : getType(val);

        typeDefinition += `${baseIndent}${key}: ${evaluatedType};\n`;
    }

    typeDefinition += `${indent}}`;
    return typeDefinition;
}

/**
 * Handles evaluation of primitive types.
 * 
 * @param {any} value - The primitive value.
 * @returns {string} The corresponding TS primitive type.
 */
function getType(value: any): string {
    if (value === null) return "null";
    const t = typeof value;
    if (["string", "number", "boolean", "bigint"].includes(t)) {
        return t;
    }
    return "any";
}

/**
 * Parses array elements to build a unified union array type.
 * 
 * @param {any[]} arr - The target array.
 * @param {string} indent - Current indentation.
 * @param {Set<any>} processed - Circular reference tracker.
 * @returns {string} The unified array type definition.
 */
function handleArrayType(arr: any[], indent: string, processed: Set<any>): string {
    if (arr.length === 0) return "any[]";

    // Merge structures if array contains objects, or collect unique primitive types
    const types = Array.from(new Set(arr.map(item => generateTypeDefinition(item, indent, processed))));
    const unifiedType = types.length > 1 ? `(${types.join(" | ")})` : types[0];

    return `${unifiedType}[]`;
}
