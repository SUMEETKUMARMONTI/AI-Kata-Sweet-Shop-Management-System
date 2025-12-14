// Load environment variables FIRST
import "dotenv/config";

import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";

import { connectDB } from "./db";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";

// Connect to MongoDB before anything else
await connectDB();

const app = express();
const server = createServer(app);

// ---------- Middleware ----------

// Capture raw body (needed for some integrations)
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false }));

// Simple request logger
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    res.locals.body = body;
    return originalJson(body);
  };

  res.on("finish", () => {
    if (path.startsWith("/api")) {
      const duration = Date.now() - start;
      console.log(
        `${req.method} ${path} ${res.statusCode} - ${duration}ms`
      );
    }
  });

  next();
});

// ---------- Routes ----------
await registerRoutes(server, app);

// ---------- Error Handler ----------
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// ---------- Frontend ----------
if (process.env.NODE_ENV === "production") {
  serveStatic(app);
} else {
  const { setupVite } = await import("./vite");
  await setupVite(server, app);
}

// ---------- Start Server ----------
const PORT = Number(process.env.PORT) || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
