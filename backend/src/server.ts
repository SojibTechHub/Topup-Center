import "dotenv/config";
import dns from "node:dns";

// Optimize DNS lookup for fast API queries (avoids Windows IPv6 timeout)
dns.setDefaultResultOrder("ipv4first");

import { createApp } from "./app";
import { env } from "./lib/env";

const PORT = process.env.PORT || 5000;
const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`
┌────────────────────────────────────────────────────────────┐
│              TOPUP CENTER — BACKEND API SERVER             │
│                                                            │
│  • Status: ONLINE (HTTP 200)                               │
│  • Port: ${PORT}                                              │
│  • Base URL: http://localhost:${PORT}/api                     │
│  • Environment: ${env.NODE_ENV}                            │
│  • Health Check: http://localhost:${PORT}/api/health          │
└────────────────────────────────────────────────────────────┘
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully...");
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
});

