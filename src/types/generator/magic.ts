export function generateTypeDefinition(obj: any, indent = ""): string {
    let typeDefinition = `${indent}\n`;

    for (const key in obj) {
        if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
            typeDefinition += `${indent}  ${key}: ${generateTypeDefinition(obj[key], `${indent}  `)};\n`;
        } else {
            typeDefinition += `${indent}  ${key}: ${getType(obj[key])};\n`;
        }
    }

    typeDefinition += `${indent}}`;

    return typeDefinition;
}

function getType(value: any): string {
    if (typeof value === "string") {
        return "string";
    } else if (typeof value === "number") {
        return "number";
    } else if (typeof value === "boolean") {
        return "boolean";
    } else if (typeof value === "bigint") {
        return "bigint";
    } else if (Array.isArray(value)) {
        if (value.length > 0 && typeof value[0] === "object" && value[0] !== null) {
            return `${generateTypeDefinition(value[0])}[]`;
        } else {
            const arrayType = Array.from(new Set(value.map((item) => getType(item))));
            return `${arrayType.join(" | ")}[]`;
        }
    } else {
        return "undefined";
    }
}
