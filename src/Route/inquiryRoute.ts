import { Router } from "express";
import {
  createInquiry,
  getAllInquiries,
  getInquiriesByStatus,
  updateInquiryStatus,
} from "../Controller/inquiryController";
import { adminAuthMiddleware } from "../MiddleWare/adminAuthmiddleware";

const inquiryRoute = Router();

// USER
inquiryRoute.post("/create", createInquiry);

// ADMIN
inquiryRoute.get("/all", adminAuthMiddleware, getAllInquiries);
inquiryRoute.get("/status", adminAuthMiddleware, getInquiriesByStatus);
inquiryRoute.put(
  "/update-status/:inquiryId",
  adminAuthMiddleware,
  updateInquiryStatus
);

export default inquiryRoute;
