import { Router, Request, Response } from "express";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/crypto";
import { signToken } from "@/lib/jwt";
import { authenticateToken } from "@/middleware/auth";
import { registerRateLimit, loginRateLimit } from "@/lib/redis";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  referralCode: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "VALIDATION_ERROR", details: parsed.error.issues });
    }

    const { name, email, phone, password, referralCode } = parsed.data;

    // Check rate limit if redis available
    try {
      const clientIp = req.ip || "127.0.0.1";
      const { success } = await registerRateLimit.limit(`reg_${clientIp}`);
      if (!success) {
        return res.status(429).json({ error: "RATE_LIMITED", message: "Too many registration attempts" });
      }
    } catch {
      // Redis offline, proceed
    }

    // Check duplicate
    const existing = await db.user.findFirst({
      where: {
        OR: [{ email }, ...(phone ? [{ phone }] : [])],
      },
    });

    if (existing) {
      return res.status(409).json({ error: "USER_ALREADY_EXISTS", message: "Email or phone already registered" });
    }

    // Check referrer
    let referredBy: string | undefined;
    if (referralCode) {
      const referrer = await db.user.findUnique({ where: { referralCode } });
      if (referrer) referredBy = referrer.id;
    }

    const passwordHash = await hashPassword(password);
    const userReferralCode = "TC" + Math.random().toString(36).substring(2, 8).toUpperCase();

    const user = await db.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        referralCode: userReferralCode,
        referredBy,
        role: "CUSTOMER",
        status: "ACTIVE",
        walletBalancePoisha: 0n,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        walletBalancePoisha: true,
        referralCode: true,
        createdAt: true,
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      token,
      user: {
        ...user,
        walletBalancePoisha: user.walletBalancePoisha.toString(),
      },
    });
  } catch (error: any) {
    console.error("Register error:", error);
    return res.status(500).json({ error: "REGISTRATION_FAILED", message: error.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "VALIDATION_ERROR", details: parsed.error.issues });
    }

    const { email, password } = parsed.data;

    try {
      const clientIp = req.ip || "127.0.0.1";
      const { success } = await loginRateLimit.limit(`login_${clientIp}`);
      if (!success) {
        return res.status(429).json({ error: "RATE_LIMITED", message: "Too many login attempts, please try again later" });
      }
    } catch {
      // Proceed if redis offline
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "INVALID_CREDENTIALS", message: "Incorrect email or password" });
    }

    if (user.status === "BANNED") {
      return res.status(403).json({ error: "ACCOUNT_BANNED", message: "Account has been suspended. Please contact support." });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "INVALID_CREDENTIALS", message: "Incorrect email or password" });
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        loyaltyTier: user.loyaltyTier,
        walletBalancePoisha: user.walletBalancePoisha.toString(),
        referralCode: user.referralCode,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "LOGIN_FAILED", message: error.message });
  }
});

// GET /api/auth/me
router.get("/me", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        status: true,
        loyaltyTier: true,
        walletBalancePoisha: true,
        totalSpentPoisha: true,
        referralCode: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "USER_NOT_FOUND" });
    }

    return res.json({
      success: true,
      user: {
        ...user,
        walletBalancePoisha: user.walletBalancePoisha.toString(),
        totalSpentPoisha: user.totalSpentPoisha.toString(),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: "ME_FETCH_FAILED", message: error.message });
  }
});

// POST /api/auth/logout
router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("auth_token");
  res.clearCookie("token");
  return res.json({ success: true, message: "Logged out successfully" });
});

export default router;

