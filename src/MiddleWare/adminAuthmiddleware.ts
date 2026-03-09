import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const ADMIN_JWT_SECRET = "ADMIN_SECRET_KEY_123";

export const adminAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    // Must be: Bearer <token>
    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      return res
        .status(401)
        .json({ message: "Invalid authorization format" });
    }

    const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as {
      adminId: string;
    };

    // 🔥 THIS IS THE CRITICAL LINE
    (req as any).adminId = decoded.adminId;

    console.log("AUTH MIDDLEWARE adminId:", decoded.adminId); // DEBUG

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
