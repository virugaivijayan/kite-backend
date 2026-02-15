// ====== BASIC BACKEND FOR RAILWAY + ZERODHA ======

const express = require("express");
const crypto = require("crypto");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
app.use(express.json());


// --------------------------------------------------
// 1) HEALTH CHECK (Railway 502 error avoid)
// --------------------------------------------------
app.get("/", (req, res) => {
  res.send("Kite Backend Running Successfully 🚀");
});


// --------------------------------------------------
// 2) LOGIN URL GENERATOR
// Open this in browser -> Zerodha login page open
// --------------------------------------------------
app.get("/login", (req, res) => {

  const apiKey = process.env.API_KEY;

  const url = `https://kite.zerodha.com/connect/login?v=3&api_key=${apiKey}`;

  res.json({
    login_url: url
  });
});


// --------------------------------------------------
// 3) ACCESS TOKEN GENERATE
// Zerodha redirect → request_token கொண்டு இங்கு வருவோம்
// --------------------------------------------------
app.get("/generate-session", async (req, res) => {

  try {

    const request_token = req.query.request_token;

    if (!request_token) {
      return res.send("Missing request_token");
    }

    const apiKey = process.env.API_KEY;
    const apiSecret = process.env.API_SECRET;

    const checksum = crypto
      .createHash("sha256")
      .update(apiKey + request_token + apiSecret)
      .digest("hex");

    const response = await fetch("https://api.kite.trade/session/token", {
      method: "POST",
      headers: {
        "X-Kite-Version": "3",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        api_key: apiKey,
        request_token: request_token,
        checksum: checksum
      })
    });

    const data = await response.json();

    res.json(data);

  } catch (err) {
    res.send(err.toString());
  }
});


// --------------------------------------------------
// SERVER START (Railway Compatible)
// --------------------------------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
