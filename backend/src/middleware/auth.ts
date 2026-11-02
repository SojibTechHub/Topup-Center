import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "@/lib/jwt";
import { db } from "@/lib/db";

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload & { walletBalancePoisha?: bigint };
    }
  }
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  let token: string | undefined;

  // 1. Authorization header (Bearer <token>)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // 2. Cookie fallback
  if (!token && req.cookies) {
    token =
      req.cookies.auth_token ||
      req.cookies.token ||
      req.cookies["authjs.session-token"] ||
      req.cookies["__Secure-authjs.session-token"];
  }

  if (!token) {
    return res.status(401).json({ error: "UNAUTHORIZED", message: "Authentication required" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "INVALID_TOKEN", message: "Token expired or invalid" });
  }

  // Verify user still exists and not banned
  try {
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, status: true, walletBalancePoisha: true },
    });

    if (!user) {
      return res.status(401).json({ error: "USER_NOT_FOUND" });
    }

    if (user.status === "BANNED") {
      return res.status(403).json({ error: "ACCOUNT_BANNED", message: "Your account has been suspended" });
    }

    req.user = {
      ...decoded,
      role: user.role,
      walletBalancePoisha: user.walletBalancePoisha,
    };

    next();
  } catch (error) {
    // If DB is temporarily disconnected, still allow if token is valid
    req.user = decoded;
    next();
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  let token: string | undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies) {
    token = req.cookies.auth_token || req.cookies.token;
  }

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  next();
}

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "FORBIDDEN", message: "Access denied: insufficient permissions" });
    }

    next();
  };
}

