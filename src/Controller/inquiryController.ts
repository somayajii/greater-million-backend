import { Request, Response } from "express";
import {
  createInquiryDAL,
  getAllInquiriesDAL,
  getInquiriesByStatusDAL,
  updateInquiryStatusDAL,
} from "../Dal/inquiryDal";

/* USER → CREATE */
export const createInquiry = async (req: Request, res: Response) => {
  try {
    const { productId, name, email, phone, message } = req.body;

    if (!productId || !name || !email || !phone) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const inquiry = await createInquiryDAL({
      productId,
      name,
      email,
      phone,
      message,
    });

    res.status(201).json({ success: true, inquiry });
  } catch (err: any) {
    console.error("CREATE INQUIRY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ADMIN → GET ALL */
export const getAllInquiries = async (_: Request, res: Response) => {
  const inquiries = await getAllInquiriesDAL();
  res.json({ success: true, inquiries });
};

/* ADMIN → GET BY STATUS */
export const getInquiriesByStatus = async (req: Request, res: Response) => {
  const { status } = req.query;

  if (!["NEW", "CONTACTED", "CLOSED"].includes(status as string)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const inquiries = await getInquiriesByStatusDAL(
    status as "NEW" | "CONTACTED" | "CLOSED"
  );

  res.json({ success: true, inquiries });
};

/* ADMIN → UPDATE STATUS */
export const updateInquiryStatus = async (
  req: Request,
  res: Response
) => {
  try {
    // ✅ normalize param
    const inquiryId =
      typeof req.params.inquiryId === "string"
        ? req.params.inquiryId
        : undefined;

    if (!inquiryId) {
      return res.status(400).json({
        message: "Invalid inquiryId",
      });
    }

    const { status } = req.body;

    if (!["CONTACTED", "CLOSED"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    await updateInquiryStatusDAL(
      inquiryId,
      status as "CONTACTED" | "CLOSED"
    );

    return res.json({
      success: true,
      message:
        status === "CLOSED"
          ? "Inquiry closed & stock updated"
          : "Inquiry status updated",
    });
  } catch (error: any) {
    console.error("UPDATE INQUIRY STATUS ERROR:", error);

    return res.status(400).json({
      message: error.message || "Failed to update inquiry",
    });
  }
};
