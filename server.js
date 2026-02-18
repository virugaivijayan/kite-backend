const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

let ACCESS_TOKEN = null;

/* STEP 1 — Login Route */
app.get("/", (req, res) => {
  const loginUrl = `https://kite.zerodha.com/connect/login?v=3&api_key=${API_KEY}`;
  res.send(`<h2><a href="${loginUrl}">Login to Zerodha</a></h2>`);
});

/* STEP 2 — Callback Route */
app.get("/callback", async (req, res) => {
  try {
    const request_token = req.query.request_token;

    if (!request_token) {
      return res.send("No request_token received.");
    }

    console.log("NEW REQUEST TOKEN:", request_token);

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

    console.log("ACCESS TOKEN CREATED");

    res.send("Access token generated successfully!");
  } catch (err) {
    console.log("FULL ERROR:", err.response?.data || err.message);
    res.send("Token expired or invalid. Please login again.");
  }
});

/* STEP 3 — Test LTP Route */
app.get("/ltp", async (req, res) => {
  try {
    if (!ACCESS_TOKEN) {
      return res.send("No access token. Please login first.");
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
    res.send("Session expired. Login again.");
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
