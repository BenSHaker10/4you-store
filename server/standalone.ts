import app from "./vercel";
import path from "path";
import { fileURLToPath } from "url";

const PORT = process.env.PORT || 3000;

// Serve static files from dist/public
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const staticPath = path.join(__dirname, "../dist/public");

import express from "express";
app.use(express.static(staticPath));

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/`);
});
