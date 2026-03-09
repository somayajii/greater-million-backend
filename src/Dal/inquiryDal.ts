import Inquiry from "../Model/Inquiry";
import Product from "../Model/Product";
import { sequelize } from "../config/db";

/* USER → CREATE INQUIRY */
export const createInquiryDAL = async (data: {
  productId: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
}) => {
  return await Inquiry.create(data);
};

/* ADMIN → GET ALL */
export const getAllInquiriesDAL = async () => {
  return await Inquiry.findAll({
    include: [{ model: Product, as: "product" }],
    order: [["createdAt", "DESC"]],
  });
};

/* ADMIN → GET BY STATUS */
export const getInquiriesByStatusDAL = async (
  status: "NEW" | "CONTACTED" | "CLOSED"
) => {
  return await Inquiry.findAll({
    where: { status },
    include: [{ model: Product, as: "product" }],
    order: [["createdAt", "DESC"]],
  });
};

/* ADMIN → UPDATE STATUS + STOCK */
export const updateInquiryStatusDAL = async (
  inquiryId: string,
  status: "CONTACTED" | "CLOSED"
) => {
  return await sequelize.transaction(async (t) => {
    const inquiry = await Inquiry.findByPk(inquiryId, {
      transaction: t,
    });

    if (!inquiry) {
      throw new Error("Inquiry not found");
    }

    const productId = inquiry.getDataValue("productId");

    if (!productId) {
      throw new Error("Inquiry has no productId");
    }

    await inquiry.update({ status }, { transaction: t });

    if (status === "CLOSED") {
      const product = await Product.findByPk(productId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!product) {
        throw new Error("Product not found");
      }

      // ✅ SAFE quantity read
      const currentQty = Number(product.getDataValue("quantity"));

      if (Number.isNaN(currentQty)) {
        throw new Error("Invalid product quantity");
      }

      if (currentQty <= 0) {
        throw new Error("Product out of stock");
      }

      await product.update(
        { quantity: currentQty - 1 },
        { transaction: t }
      );
    }

    return true;
  });
};


