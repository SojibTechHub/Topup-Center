import { Router, Request, Response } from "express";
import { authenticateToken } from "@/middleware/auth";
import { db } from "@/lib/db";

const router = Router();

// GET /api/support/tickets
router.get("/support/tickets", authenticateToken, async (req: Request, res: Response) => {
  try {
    const tickets = await db.supportTicket.findMany({
      where: { userId: req.user!.userId },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, tickets });
  } catch (error: any) {
    return res.status(500).json({ error: "TICKETS_FETCH_FAILED" });
  }
});

// POST /api/support/tickets
router.post("/support/tickets", authenticateToken, async (req: Request, res: Response) => {
  const { subject, message, orderId } = req.body;

  if (!subject || !message) {
    return res.status(400).json({ error: "SUBJECT_AND_MESSAGE_REQUIRED" });
  }

  try {
    const ticket = await db.supportTicket.create({
      data: {
        userId: req.user!.userId,
        subject,
        orderId,
        status: "OPEN",
        priority: "MEDIUM",
        messages: {
          create: {
            userId: req.user!.userId,
            body: message,
            isInternal: false,
          },
        },
      },
      include: { messages: true },
    });

    return res.status(201).json({ success: true, ticket });
  } catch (error: any) {
    return res.status(500).json({ error: "TICKET_CREATION_FAILED", message: error.message });
  }
});

export default router;
