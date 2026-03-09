import Product from "../Model/Product";
import { Op, literal,fn, col, where } from "sequelize";


/* CREATE */
export const createProductDAL = async (data: any) => {
  return await Product.create(data);
};

/* UPDATE */
export const updateProductDAL = async (
  productId: string,
  data: any
) => {
  const product = await Product.findByPk(productId);
  if (!product) return null;

  await product.update(data);
  return product;
};

/* GET ALL */
export const getAllProductsDAL = async () => {
  return await Product.findAll({
    order: [["createdAt", "DESC"]],
  });
};

/*
  FLEXIBLE FETCHING:
  - group only
  - group + type
  - group + type + subType
*/
export const getProductsByCategoryDAL = async (
  group?: string,
  type?: string,
  subType?: string | null
) => {
  const where: any = {};

  if (group) {
    where[Op.and] = [
      literal(`category->>'group' = '${group}'`)
    ];
  }

  if (type) {
    where[Op.and] = [
      ...(where[Op.and] || []),
      literal(`category->>'type' = '${type}'`)
    ];
  }

  if (subType) {
    where[Op.and] = [
      ...(where[Op.and] || []),
      literal(`category->>'subType' = '${subType}'`)
    ];
  }

  return await Product.findAll({ where });
};

/* DELETE */
export const deleteProductDAL = async (productId: string) => {
  const product = await Product.findByPk(productId);
  if (!product) return null;

  await product.destroy();
  return product; // 👈 needed to delete images
};


export const searchProductsDal = async (query: string) => {
  if (!query || query.trim().length < 2) return [];

  const q = query.toLowerCase();

  return await Product.findAll({
    where: {
      [Op.or]: [
        // 🔹 Product name (contains)
        {
          name: {
            [Op.iLike]: `%${q}%`,
          },
        },

        // 🔹 category.group
        literal(`LOWER("Product"."category"->>'group') LIKE '%${q}%'`),

        // 🔹 category.type
        literal(`LOWER("Product"."category"->>'type') LIKE '%${q}%'`),

        // 🔹 category.subType
        literal(
          `LOWER("Product"."category"->>'subType') LIKE '%${q}%'`
        ),
      ],
    },

    attributes: ["id", "name"],
    order: [["name", "ASC"]],
    limit: 10,
  });
};

/**
 * Get full product data by ID
 */
export const getProductByIdDal = async (id: string) => {
  return await Product.findByPk(id);
};