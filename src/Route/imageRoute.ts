import express from "express";
import { upload } from "../MiddleWare/uploads";
import { uploadImageController } from "../Controller/ImageController";

const imageRouter = express.Router();

imageRouter.post("/upload-image", upload.single("image"), uploadImageController);

export default imageRouter;