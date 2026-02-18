const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

let ACCESS_TOKEN = null;

app.get("/", (req, res) => {
  const loginUrl = `https://kite.zerodha.com/connect/login?api_key=${API_KEY}&v=3`;
  res.send(`<a href="${loginUrl}">Login to Zerodha</a>`);
});

app.get("/callback", async (req, res) => {
  try {
    const request_token = req.query.request_token;

    console.log("REQUEST TOKEN:", request_token);

    if (!request_token) {
      return res.send("No request_token received.");
    }

    const checksum = crypto
      .createHash("sha256")
      .update(API_KEY + request_token + API_SECRET)
      .digest("hex");

    console.log("CHECKSUM:", checksum);

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

    console.log("ACCESS TOKEN:", ACCESS_TOKEN);

    res.send("Access token generated successfully!");
  } catch (err) {
    console.log("FULL ERROR RESPONSE:");
    console.log(err.response?.data || err.message);
    res.send("Error generating access token. Check Railway logs.");
  }
});

app.listen(PORT, () => {
  console.log("Server running...");
});
