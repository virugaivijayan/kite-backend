const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

let ACCESS_TOKEN = null;

/* =========================
   STEP 1 – Login Route
========================= */
app.get("/", (req, res) => {
  const loginUrl = `https://kite.zerodha.com/connect/login?v=3&api_key=${API_KEY}`;
  res.send(`
    <h2>Kite Login</h2>
    <a href="${loginUrl}">Login to Zerodha</a>
  `);
});

/* =========================
   STEP 2 – Callback
========================= */
app.get("/callback", async (req, res) => {
  try {
    const request_token = req.query.request_token;

    if (!request_token) {
      return res.send("No request_token received");
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
        checksum: checksum
      }),
      {
        headers: {
          "X-Kite-Version": "3",
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    ACCESS_TOKEN = response.data.data.access_token;

    res.send(`
      <h2>Access Token Generated Successfully</h2>
      <p>${ACCESS_TOKEN}</p>
      <a href="/profile">Check Profile</a>
    `);

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.send("Error generating access token");
  }
});

/* =========================
   STEP 3 – Profile Route
========================= */
app.get("/profile", async (req, res) => {
  if (!ACCESS_TOKEN) {
    return res.json({ error: "Not logged in" });
  }

  try {
    const profile = await axios.get(
      "https://api.kite.trade/user/profile",
      {
        headers: {
          "X-Kite-Version": "3",
          "Authorization": `token ${API_KEY}:${ACCESS_TOKEN}`
        }
      }
    );

    res.json(profile.data);

  } catch (err) {
    res.json({ error: "Session expired or invalid token" });
  }
});

/* =========================
   STEP 4 – LTP Route
========================= */
app.get("/ltp/:symbol", async (req, res) => {
  if (!ACCESS_TOKEN) {
    return res.json({ error: "Not logged in" });
  }

  try {
    const symbol = req.params.symbol;

    const response = await axios.get(
      `https://api.kite.trade/quote/ltp?i=${symbol}`,
      {
        headers: {
          "X-Kite-Version": "3",
          "Authorization": `token ${API_KEY}:${ACCESS_TOKEN}`
        }
      }
    );

    res.json(response.data);

  } catch (err) {
    res.json({ error: "Failed to fetch LTP" });
  }
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
