#!/usr/bin/env node
// Start a server, wait until a URL responds, run a command, then stop the server.
// Usage: node with-server.mjs --cmd "npm run dev" --url http://localhost:3000 [--timeout 120] -- <command...>
import { spawn } from "node:child_process";

const argv = process.argv.slice(2);
if (argv.includes("--help") || argv.includes("-h") || !argv.includes("--")) {
  console.log(`Usage: node with-server.mjs --cmd "<start command>" --url <url> [--timeout <seconds>] -- <command to run>
Starts the server, waits until <url> answers (any HTTP status below 500), runs the command,
stops the server and exits with the command's exit code.
Example: node with-server.mjs --cmd "npm run dev" --url http://localhost:3000 -- npx playwright test`);
  process.exit(argv.includes("--") ? 0 : 1);
}

const sep = argv.indexOf("--");
const opts = argv.slice(0, sep);
const run = argv.slice(sep + 1);
const get = (k, d) => { const i = opts.indexOf(k); return i >= 0 ? opts[i + 1] : d; };
const startCmd = get("--cmd");
const url = get("--url");
const timeout = Number(get("--timeout", "120")) * 1000;
if (!startCmd || !url || run.length === 0) { console.error("Need --cmd, --url and a command after --"); process.exit(1); }

const server = spawn(startCmd, { shell: true, stdio: ["ignore", "pipe", "pipe"], detached: true });
let log = "";
server.stdout.on("data", (d) => { log += d; });
server.stderr.on("data", (d) => { log += d; });
let serverExited = false;
server.on("exit", () => { serverExited = true; });

const stop = () => { try { process.kill(-server.pid, "SIGTERM"); } catch {} };
process.on("SIGINT", () => { stop(); process.exit(130); });

const deadline = Date.now() + timeout;
let ready = false;
while (Date.now() < deadline && !serverExited) {
  try {
    const res = await fetch(url, { redirect: "manual" });
    if (res.status < 500) { ready = true; break; }
  } catch {}
  await new Promise((r) => setTimeout(r, 1000));
}
if (!ready) {
  console.error(`Server did not become ready at ${url} within ${timeout / 1000}s.${serverExited ? " It exited early." : ""}\n--- server output (last 40 lines) ---`);
  console.error(log.split("\n").slice(-40).join("\n"));
  stop();
  process.exit(1);
}
console.log(`Server ready at ${url}. Running: ${run.join(" ")}`);
const child = spawn(run[0], run.slice(1), { stdio: "inherit", shell: process.platform === "win32" });
child.on("exit", (code) => { stop(); process.exit(code ?? 1); });
