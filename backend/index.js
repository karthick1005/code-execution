const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(bodyParser.json());

const SUPPORTED_LANGUAGES = {
    python: {
        ext: "py",
        service: "python-compiler", // This is the Docker service name
        port: 4000, // Assume the Python service is listening on port 4000
    },
    javascript: {
        ext: "js",
        service: "nodejs-compiler", // This is the Docker service name
        port: 5000, // Assume the Node.js service is listening on port 5000
    },
};

const codeDir = path.join(__dirname, "..", "temp_code");
if (!fs.existsSync(codeDir)) {
    fs.mkdirSync(codeDir);
}

app.post("/submit-code", async (req, res) => {
    const { language, code } = req.body;

    if (!SUPPORTED_LANGUAGES[language]) {
        return res.status(400).send({ error: "Unsupported language" });
    }

    const ext = SUPPORTED_LANGUAGES[language].ext;
    const filename = `solution.${ext}`;
    const filePath = path.join(codeDir, filename);

    // Write the code to the shared volume (temp_code)
    fs.writeFileSync(filePath, code);

    const serviceUrl = `http://${SUPPORTED_LANGUAGES[language].service}:${SUPPORTED_LANGUAGES[language].port}/run-code`;

    try {
        const response = await axios.post(serviceUrl, { filename, timeout: 100 });

        res.json(response.data);
    } catch (error) {
        console.log(error)
        if (error.response) {
            // If the compiler service returned an error response
            res.status(error.response.status).send({
                error: error.response.data.error || "An error occurred during execution",
                details: error.response.data.details || "No additional details available",
            });
        } else {
            // If there was an error with the request itself
            res.status(500).send({ error: error.message });
        }
    }
});
function formatErrorMessage(error) {
    const message = error.response?.data?.error || error.message;

    // Regex to extract the line and column information
    const regex = /Line (\d+): Char (\d+)/;
    const matches = message.match(regex);

    if (matches) {
        const line = matches[1];
        const char = matches[2];
        return `Line ${line}: Char ${char}: ${message}`;
    }

    return message; // Fallback to the original message if regex fails
}
app.listen(3000, () => {
    console.log("Code execution server running on port 3000");
});
