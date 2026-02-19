const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

const GROWW_API_KEY = process.env.GROWW_API_KEY;
const GROWW_ACCESS_TOKEN = process.env.GROWW_ACCESS_TOKEN;

/* -----------------------------
   Home Route
------------------------------*/
app.get("/", (req, res) => {
  res.send("Groww API Backend Running 🚀");
});

/* -----------------------------
   Check Server Status
------------------------------*/
app.get("/status", (req, res) => {
  res.json({
    server: "running",
    apiKeyLoaded: !!GROWW_API_KEY,
    tokenLoaded: !!GROWW_ACCESS_TOKEN
  });
});

/* -----------------------------
   LTP Route
   Example:
   /ltp?symbol=NSE:RELIANCE
------------------------------*/
app.get("/ltp", async (req, res) => {
  try {
    const symbol = req.query.symbol;

    if (!symbol) {
      return res.status(400).json({ error: "Symbol required" });
    }

    if (!GROWW_ACCESS_TOKEN) {
      return res.status(400).json({ error: "Access token missing" });
    }

    const response = await axios.get(
      `https://api.groww.in/v1/quote/ltp?symbol=${symbol}`,
      {
        headers: {
          Authorization: `Bearer ${GROWW_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          "X-API-KEY": GROWW_API_KEY
        }
      }
    );

    res.json(response.data);

  } catch (err) {
    console.log("GROWW API ERROR:", err.response?.data || err.message);

    res.status(500).json({
      error: "API Call Failed",
      details: err.response?.data || err.message
    });
  }
});

/* -----------------------------
   Start Server
------------------------------*/
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
