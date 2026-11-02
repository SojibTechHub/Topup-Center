import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/error";

// Routes
import authRoutes from "./routes/auth.routes";
import catalogRoutes from "./routes/catalog.routes";
import ordersRoutes from "./routes/orders.routes";
import walletRoutes from "./routes/wallet.routes";
import paymentsRoutes from "./routes/payments.routes";
import adminRoutes from "./routes/admin.routes";
import aiRoutes from "./routes/ai.routes";
import supportRoutes from "./routes/support.routes";
import cronRoutes from "./routes/cron.routes";
import healthRoutes from "./routes/health.routes";

export function createApp(): Application {
  const app = express();

  // Middleware
  const allowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    process.env.FRONTEND_URL,
    process.env.APP_URL,
  ].filter(Boolean) as string[];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, server-to-server)
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some((o) => origin.startsWith(o))) {
          callback(null, true);
        } else {
          callback(null, true); // Dev permissive
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "RT-UDDOKTAPAY-API-KEY"],
    })
  );

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(cookieParser() as any);

  // Mount API routers
  app.use("/api", healthRoutes);
  app.use("/api", authRoutes);
  app.use("/api", catalogRoutes);
  app.use("/api", ordersRoutes);
  app.use("/api", walletRoutes);
  app.use("/api", paymentsRoutes);
  app.use("/api", adminRoutes);
  app.use("/api", aiRoutes);
  app.use("/api", supportRoutes);
  app.use("/api", cronRoutes);

  // 404 Route
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: "ENDPOINT_NOT_FOUND",
      path: req.originalUrl,
      method: req.method,
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

