import { spawn } from "child_process";
import http from "http";

// Keep-alive HTTP server on port 3001
const server = http.createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("keeper alive");
});

server.listen(3001, () => {
  console.log("Keeper alive on port 3001");
});

// Spawn and keep Next.js dev server alive
function startNext() {
  const child = spawn("npx", ["next", "dev", "-p", "3000"], {
    cwd: "/home/z/my-project",
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env },
  });

  child.stdout?.on("data", (data) => {
    process.stdout.write(data.toString());
  });

  child.stderr?.on("data", (data) => {
    process.stderr.write(data.toString());
  });

  child.on("close", (code) => {
    console.log(`Next.js exited with code ${code}. Restarting in 3s...`);
    setTimeout(startNext, 3000);
  });

  child.on("error", (err) => {
    console.error("Failed to start Next.js:", err);
    setTimeout(startNext, 3000);
  });

  return child;
}

startNext();
