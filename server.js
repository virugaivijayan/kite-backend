const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

// Use ENV token if exists
let ACCESS_TOKEN = process.env.ACCESS_TOKEN || null;

/* STEP 1 — Login */
app.get("/", (req, res) => {
  const loginUrl = `https://kite.zerodha.com/connect/login?v=3&api_key=${API_KEY}`;
  res.send(`<h2><a href="${loginUrl}">Login to Zerodha</a></h2>`);
});

/* STEP 2 — Callback */
app.get("/callback", async (req, res) => {
  try {
    const request_token = req.query.request_token;

    if (!request_token) {
      return res.send("No request_token received.");
    }

    const checksum = crypto
      .createHash("sha256")
      .update(API_KEY + request_token + API_SECRET)
      .digest("hex");

    const response = await axios.post(
      "https://api.kite.trade/session/token",
      new URLSearchParams({
        api_key: API_KEY,
        request_token: request_token,
        checksum: checksum,
      }).toString(),
      {
        headers: {
          "X-Kite-Version": "3",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    ACCESS_TOKEN = response.data.data.access_token;

    console.log("NEW ACCESS TOKEN:", ACCESS_TOKEN);

    res.send(`
      <h2>Access token generated successfully!</h2>
      <p>Copy this token and paste in Railway ENV as ACCESS_TOKEN</p>
      <textarea rows="3" cols="60">${ACCESS_TOKEN}</textarea>
    `);
  } catch (err) {
    console.log("TOKEN ERROR:", err.response?.data || err.message);
    res.send("Token expired or invalid. Login again.");
  }
});

/* STEP 3 — LTP */
app.get("/ltp", async (req, res) => {
  try {
    if (!ACCESS_TOKEN) {
      return res.send("No access token found. Login first.");
    }

    const response = await axios.get(
      "https://api.kite.trade/quote/ltp?i=NSE:RELIANCE",
      {
        headers: {
          Authorization: `token ${API_KEY}:${ACCESS_TOKEN}`,
          "X-Kite-Version": "3",
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.log("LTP ERROR:", err.response?.data || err.message);
    res.send("Session expired. Generate new token.");
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
