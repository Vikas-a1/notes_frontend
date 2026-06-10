import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const scriptUrl =
  process.env.GOOGLE_SCRIPT_URL || process.env.VITE_GOOGLE_SCRIPT_URL || "";

const config = {
  name: "notes-frontend",
  main: "worker.js",
  compatibility_date: "2025-04-01",
  assets: {
    directory: "./dist",
    binding: "ASSETS",
  },
};

if (scriptUrl) {
  config.vars = { GOOGLE_SCRIPT_URL: scriptUrl };
  console.log("Injecting GOOGLE_SCRIPT_URL from build environment into Worker vars.");
} else {
  console.warn(
    "Warning: GOOGLE_SCRIPT_URL / VITE_GOOGLE_SCRIPT_URL not set in build env. " +
      "Contact form will return 503 until configured in Cloudflare Builds or Worker Settings."
  );
}

writeFileSync("wrangler.deploy.json", JSON.stringify(config, null, 2));

execSync("npx wrangler deploy --config wrangler.deploy.json", {
  stdio: "inherit",
});
