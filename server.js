import express from "express";
import crypto from "crypto";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

app.get("/", (req,res)=>{
    res.send("Kite Backend Running");
});

app.get("/login", (req,res)=>{
    const url = `https://kite.zerodha.com/connect/login?v=3&api_key=${API_KEY}`;
    res.redirect(url);
});

app.get("/callback", async (req,res)=>{
    const request_token = req.query.request_token;

    const checksum = crypto
        .createHash("sha256")
        .update(API_KEY + request_token + API_SECRET)
        .digest("hex");

    const response = await fetch("https://api.kite.trade/session/token",{
        method:"POST",
        headers:{ "Content-Type":"application/x-www-form-urlencoded" },
        body:`api_key=${API_KEY}&request_token=${request_token}&checksum=${checksum}`
    });

    const data = await response.json();
    res.json(data);
});

app.listen(3000, ()=>console.log("running"));
