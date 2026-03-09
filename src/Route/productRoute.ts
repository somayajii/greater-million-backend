import { Router } from "express";
import { upload } from "../MiddleWare/uploads";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductByIdController,
  getProductsByCategory,
  searchProductsController,
  updateProduct,
} from "../Controller/productController";
import { adminAuthMiddleware } from "../MiddleWare/adminAuthmiddleware";

const productRoute = Router();

productRoute.post(
  "/create",
  adminAuthMiddleware,          // 🔐 ADMIN ONLY
  upload.array("images", 5),    // 🖼️ images
  createProduct
);
productRoute.get("/all", getAllProducts);
productRoute.get("/category", getProductsByCategory);
productRoute.put(
  "/products/:productId",
  adminAuthMiddleware,
  upload.single("image"),       // 🔥 REQUIRED FOR FormData UPDATE
  updateProduct
);
productRoute.delete("/delete/:productId", adminAuthMiddleware,deleteProduct);
productRoute.get("/search", searchProductsController);

/**
 * Get full product by ID
 * GET /product/:id
 */
productRoute.get("/:id", getProductByIdController);

export default productRoute;
