import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./server/_core/oauth";
import { appRouter } from "./server/routers";
import { createContext } from "./server/_core/context";
import { generalLimiter, authLimiter, setupSecurityHeaders } from "./server/security";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("trust proxy", 1);
setupSecurityHeaders(app);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Rate limiters
app.use("/api/trpc", generalLimiter);
app.use("/api/oauth", authLimiter);

// OAuth routes
registerOAuthRoutes(app);

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Static files and SPA handling in production
if (process.env.NODE_ENV === "production") {
  const publicPath = path.resolve(__dirname, "public");
  app.use(express.static(publicPath));
  
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(publicPath, "index.html"));
    }
  });
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export the Express app for Vercel Serverless Function
export default app;
