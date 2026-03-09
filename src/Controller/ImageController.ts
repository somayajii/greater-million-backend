import { Request, Response } from "express";
import { uploadImageToSupabase } from "../Dal/imageDal";

export const uploadImageController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const imageUrl = await uploadImageToSupabase(req.file);

    return res.status(200).json({
      success: true,
      imageUrl,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};