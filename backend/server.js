const path = require("path");
const express = require("express");
const dotenv = require("dotenv");

// Load the local-only backend/.env file when running on your computer.
// Vercel supplies environment variables through Project Settings instead.
dotenv.config({ path: path.join(__dirname, ".env") });

const connectDB = require("./config/db");
const apiApp = require("./app");

const app = express();
const projectRoot = path.join(__dirname, "..");

// Never expose backend source files as static assets.
app.use("/backend", (req, res) => res.sendStatus(404));

// Serve the existing HTML, CSS, JavaScript, and image files locally.
app.use(express.static(projectRoot));
app.use(apiApp);

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await connectDB();
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`MEDICO is running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("MEDICO startup failed:", error.message);
        process.exitCode = 1;
    }
}

startServer();
