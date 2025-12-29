import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const buildDir = "./build";
const packageFile = path.join(buildDir, "package.json");

// Proper __dirname replacement for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the original package.json
const originalPackageData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "package.json"), "utf-8")
);

// Whitelist runtime dependencies
const runtimeDeps = ["discord.js", "bedrock-protocol", "minecraft-data"];

// Extract only required dependencies
const dependencies = {};
for (const dep of runtimeDeps) {
    if (originalPackageData.dependencies?.[dep]) {
        dependencies[dep] = originalPackageData.dependencies[dep];
    } else if (originalPackageData.devDependencies?.[dep]) {
        // fallback if still listed under devDependencies
        dependencies[dep] = originalPackageData.devDependencies[dep];
    }
}

// Build minimal package.json for distribution
const packageData = {
    name: originalPackageData.name,
    version: originalPackageData.version,
    productName: originalPackageData.productName,
    description: originalPackageData.description,
    type: "module",
    dependencies
};

// Ensure build directory exists
fs.mkdirSync(buildDir, { recursive: true });

// Write the modified package.json
fs.writeFileSync(packageFile, JSON.stringify(packageData, null, 2));
