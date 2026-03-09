import { Router } from "express";
import {
  createAdmin,
  adminLogin,
  adminProfile,
} from "../Controller/adminController";
import { adminAuthMiddleware } from "../MiddleWare/adminAuthmiddleware";

const adminRoute = Router();

adminRoute.post("/create", createAdmin);
adminRoute.post("/login", adminLogin);
adminRoute.get("/profile", adminAuthMiddleware, adminProfile);

export default adminRoute;
