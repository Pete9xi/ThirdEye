import fs from "fs";
import path from "path";

const buildDir = "./build"; // Change this to your build directory
const packageFile = path.join(buildDir, "package.json");

// Get the directory path of the current module
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Read the original package.json file
const originalPackageData = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"), "utf-8"));

// Extract the required fields
const packageData = {
    name: originalPackageData.name,
    version: originalPackageData.version,
    productName: originalPackageData.productName,
    description: originalPackageData.description,
    type: "module",
};

// Write the modified package.json to the build directory
fs.writeFileSync(packageFile, JSON.stringify(packageData, null, 2));
