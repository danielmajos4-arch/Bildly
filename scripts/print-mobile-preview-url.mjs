#!/usr/bin/env node
/**
 * Prints URLs to open on your phone (same Wi‑Fi) while `next dev` is running.
 */
import os from "node:os";

const port = process.env.PORT ?? "3000";
const addrs = [];

for (const nets of Object.values(os.networkInterfaces())) {
  if (!nets) continue;
  for (const net of nets) {
    if (net.family === "IPv4" && !net.internal) {
      addrs.push(net.address);
    }
  }
}

console.log("\n  ── Mobile preview (same Wi‑Fi as this Mac) ──\n");
if (addrs.length === 0) {
  console.log("  No LAN IPv4 found. Connect to Wi‑Fi, then run this again.\n");
} else {
  for (const ip of addrs) {
    console.log(`    http://${ip}:${port}`);
  }
  console.log(
    "\n  Tip: If the page won’t load, allow incoming connections for Node in\n" +
      "  System Settings → Network → Firewall, or try another network.\n" +
      "  For Clerk sign-in on device, add these origins in the Clerk dashboard:\n" +
      `  ${addrs.map((ip) => `http://${ip}:${port}`).join(", ")}\n`
  );
}
