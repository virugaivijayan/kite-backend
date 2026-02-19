const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

const API_TOKEN = process.env.GROWW_API_TOKEN;

app.get("/", (req, res) => {
  res.send("Groww API Backend Running 🚀");
});

/* STEP 1 - Get Instrument */
app.get("/instrument", async (req, res) => {
  try {
    const symbol = req.query.symbol; // example NSE-RELIANCE

    const response = await axios.get(
      `https://api.groww.in/v1/instruments/${symbol}`,
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`
        }
      }
    );

    res.json(response.data);

  } catch (err) {
    res.status(500).json({
      error: "Instrument fetch failed",
      details: err.response?.data || err.message
    });
  }
});

/* STEP 2 - Get LTP */
app.get("/ltp", async (req, res) => {
  try {
    const exchangeSymbol = req.query.symbol; // NSE_RELIANCE
    const segment = req.query.segment;       // CASH

    const response = await axios.get(
      `https://api.groww.in/v1/market/ltp`,
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`
        },
        params: {
          exchange_trading_symbols: exchangeSymbol,
          segment: segment
        }
      }
    );

    res.json(response.data);

  } catch (err) {
    res.status(500).json({
      error: "LTP fetch failed",
      details: err.response?.data || err.message
    });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
