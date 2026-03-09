import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  createAdminDAL,
  getAdminByEmailDAL,
  comparePasswordDAL,
  getAdminProfileDAL,
} from "../Dal/adminDal";

const ADMIN_JWT_SECRET = "ADMIN_SECRET_KEY_123";

/* ======================
   CREATE ADMIN
====================== */
export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email & password required" });
    }

    const existing = await getAdminByEmailDAL(email);
    if (existing) {
      return res
        .status(409)
        .json({ message: "Admin already exists" });
    }

    // ✅ correct DAL call
    const admin = await createAdminDAL(
      email,
      password,
      "admin"
    );

    return res.status(201).json({
      id: admin.id,
      email: admin.email,
      role: admin.role,
    });
  } catch (err: any) {
    console.error("CREATE ADMIN ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

/* ======================
   ADMIN LOGIN
====================== */
export const adminLogin = async (req: Request, res: Response) => {
  try {
    console.log("LOGIN BODY:", req.body);

    const { email, password } = req.body;

    const admin = await getAdminByEmailDAL(email);
    console.log("ADMIN FOUND:", admin?.toJSON());

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Correct usage
    const isMatch = comparePasswordDAL(password, admin);
    console.log("PASSWORD MATCH:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔥 MUST SIGN adminId
    const token = jwt.sign(
      { adminId: admin.getDataValue("id") },
      ADMIN_JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({ token });
  } catch (err: any) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

/* ======================
   ADMIN PROFILE
====================== */
export const adminProfile = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).adminId;

    console.log("PROFILE adminId:", adminId);

    if (!adminId) {
      return res.status(401).json({ message: "Admin not authenticated" });
    }

    // ✅ USE DAL
    const admin = await getAdminProfileDAL(adminId);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.status(200).json({
      success: true,
      admin,
    });
  } catch (err: any) {
    console.error("PROFILE ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};
