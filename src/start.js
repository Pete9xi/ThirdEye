const { spawn } = require("child_process");

function startMain() {
    // Spawn a new process to execute main.js
    const mainProcess = spawn("node", ["main.js"]);

    // Listen for the exit event of the main process
    mainProcess.on("exit", (code) => {
        console.log(`main.js exited with code ${code}`);
        console.log("Restarting main.js...");
        startMain(); // Restart main.js
    });

    // Optional: Listen for the output of the main process
    mainProcess.stdout.on("data", (data) => {
        console.log(`Output from main.js: ${data}`);
    });

    // Optional: Listen for any errors in the main process
    mainProcess.stderr.on("data", (data) => {
        console.error(`Error in main.js: ${data}`);
    });
}

// Start main.js
startMain();
