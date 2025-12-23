/**
 * IDWise Sandbox Dummy Verification (EU Region)
 * - Generates short-lived client token
 * - Serves a static dummy verification page
 *
 * EU Base URL: https://api.idwise.com
 */

import "dotenv/config";
import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const PORT = 3000;

/* ===============================
   IDWISE CONFIG (EU REGION)
================================ */
const IDWISE_BASE_URL = "https://api.idwise.com";

// 🔐 MUST be environment variables (do NOT hardcode)
const IDWISE_API_KEY = process.env.IDWISE_API_KEY;
const IDWISE_API_SECRET = process.env.IDWISE_API_SECRET;

if (!IDWISE_API_KEY || !IDWISE_API_SECRET) {
  console.error("❌ Missing IDWISE_API_KEY or IDWISE_API_SECRET");
  process.exit(1);
}

function basicAuth(key, secret) {
  return (
    "Basic " +
    Buffer.from(`${key}:${secret}`, "utf8").toString("base64")
  );
}

/* ===============================
   Generate Client Token (Sandbox)
================================ */
app.get("/api/idwise/client-token", async (req, res) => {
  try {
    const response = await fetch(
      `${IDWISE_BASE_URL}/journey/v2/generate-client-token`,
      {
        method: "POST",
        headers: {
          "Authorization": basicAuth(
            IDWISE_API_KEY,
            IDWISE_API_SECRET
          ),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          environment: "sandbox",
          expires_in: 15   // minutes
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: data
      });
    }

    const token =
      data.token ||
      data.clientToken ||
      data.client_token ||
      data.clientSessionToken;

    if (!token) {
      return res.status(500).json({
        ok: false,
        error: "Token not found in response",
        raw: data
      });
    }

    res.json({
      ok: true,
      token
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: String(err)
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ IDWise dummy running: http://localhost:${PORT}`);
});