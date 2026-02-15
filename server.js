const express = require("express");
const axios = require("axios");
const crypto = require("crypto");

const app = express();

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

app.get("/", (req, res) => {
  res.send("Kite Backend Running Successfully 🚀");
});

/* Zerodha redirect வரும் இடம் */
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
          "X-Kite-Version": "3",
          "Content-Type": "application/json",
        },
      }
    );

    const access_token = response.data.data.access_token;

    res.send(`
      <h2>Access Token Generated Successfully ✅</h2>
      <h3>${access_token}</h3>
    `);

  } catch (err) {
    res.send("Token generation failed: " + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on " + PORT));
