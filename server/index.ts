import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  const startYouTubeRecommender = () => {
    try {
      const projectDir = path.join(process.cwd(), "youtube recommender ifsb", "project");
      const child = spawn("npm run dev", [], {
        cwd: projectDir,
        stdio: "pipe",
        env: { ...process.env },
        shell: true,
      });
      child.stdout.on("data", (data) => {
        log(data.toString().trim(), "yt-dev");
      });
      child.stderr.on("data", (data) => {
        log(data.toString().trim(), "yt-dev");
      });
      child.on("close", (code) => {
        log(`YouTube dev exited with code ${code}`, "yt-dev");
      });
    } catch (e) {
      log(`Failed to start YouTube recommender dev: ${(e as Error).message}`, "yt-dev");
    }
  };

  if (app.get("env") === "development") {
    startYouTubeRecommender();
    app.get("/youtube*", (req, res) => {
      const pathSuffix = req.path.replace(/^\/youtube/, "");
      const target = `http://localhost:5173${pathSuffix || "/"}`;
      res.redirect(302, target);
    });
    await setupVite(app, server);
  } else {
    serveStatic(app);

    const ytDist = path.join(process.cwd(), "youtube recommender ifsb", "project", "dist");
    if (fs.existsSync(ytDist)) {
      app.use("/youtube", express.static(ytDist));
      app.get("/youtube/*", (_req, res) => {
        res.sendFile(path.join(ytDist, "index.html"));
      });
      log(`YouTube recommender served at /youtube from ${ytDist}`);
    } else {
      log(`YouTube recommender build not found at ${ytDist}. Run build for subproject before start.`);
    }
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '3000', 10);
  
  // Remove the host and reusePort options which might be causing issues on Windows
  server.listen(port, 'localhost', () => {
    log(`Server is running on http://localhost:${port}`);
    log(`Environment: ${process.env.NODE_ENV}`);
  });
  
  // Handle server errors
  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.syscall !== 'listen') {
      throw error;
    }
    
    switch (error.code) {
      case 'EACCES':
        log(`Port ${port} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        log(`Port ${port} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  });
})();
