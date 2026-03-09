import Product from "./Product";
import Inquiry from "./Inquiry";

export const setupAssociations = () => {
  Product.hasMany(Inquiry, {
    foreignKey: "productId",
    as: "inquiries",
  });

  Inquiry.belongsTo(Product, {
    foreignKey: "productId",
    as: "product",
  });
};
