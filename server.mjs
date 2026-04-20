/*
## Metadata
name: JCI Seating Static Server
description: Minimal Node static server for the rebuilt JCI seating protocol webapp.
*/

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const HOST = "127.0.0.1";
const PORT = 5001;
const ROOT = new URL("./frontend/", import.meta.url);

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
]);

function resolvePath(urlPath) {
  const cleanPath = normalize(urlPath === "/" ? "/index.html" : urlPath).replace(/^(\.\.[/\\])+/, "");
  return new URL(`.${cleanPath}`, ROOT);
}

createServer(async (req, res) => {
  try {
    const fileUrl = resolvePath(req.url || "/");
    const body = await readFile(fileUrl);
    const type = contentTypes.get(extname(fileUrl.pathname)) || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}).listen(PORT, HOST, () => {
  console.log(`JCI Seating Protocol running at http://${HOST}:${PORT}`);
});
