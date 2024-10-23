const express = require("express");
const { exec } = require("child_process");
const path = require("path");

const app = express();
app.use(express.json());

app.post("/run-code", (req, res) => {
    const { filename, timeout } = req.body;

    if (!filename) {
        return res.status(400).send({ error: "No filename provided" });
    }

    const filePath = path.join("/usr/src/temp_code", filename);

    const child = exec(`node ${filePath}`, { timeout: timeout * 1000 }, (error, stdout, stderr) => {
        if (error && error.killed) {
            return res.status(408).send({ error: `Code execution timed out after ${timeout} seconds`, details: stderr });
        } else if (error) {
            return res.status(500).send({ error: error.message, details: stderr });
        }


        res.json({
            output: stdout,
        });
    });
});


app.listen(5000, () => {
    console.log("Node.js code execution server running on port 5000");
});
