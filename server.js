const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

/* STEP 1 — Login */
app.get("/", (req, res) => {
    const loginUrl = `https://kite.zerodha.com/connect/login?api_key=${API_KEY}&v=3`;
    res.send(`<h2><a href="${loginUrl}">Login to Zerodha</a></h2>`);
});

/* STEP 2 — Callback + Generate Access Token */
app.get("/callback", async (req, res) => {
    try {
        const request_token = req.query.request_token;

        if (!request_token) {
            return res.send("No request token received");
        }

        const checksum = crypto
            .createHash("sha256")
            .update(API_KEY + request_token + API_SECRET)
            .digest("hex");

        const response = await axios.post(
            "https://api.kite.trade/session/token",
            {
                api_key: API_KEY,
                request_token: request_token,
                checksum: checksum,
            },
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "X-Kite-Version": "3",
                },
            }
        );

        const access_token = response.data.data.access_token;

        res.send(`
            <h2>✅ Access Token Generated Successfully</h2>
            <h3>${access_token}</h3>
            <p>Copy and save this token</p>
        `);

    } catch (err) {
        console.error(err.response?.data || err.message);
        res.send("❌ Token generation failed. Do NOT refresh. Login again.");
    }
});

app.listen(PORT, () => console.log("Server running on port " + PORT));
