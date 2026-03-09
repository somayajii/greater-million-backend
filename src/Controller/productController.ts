import { Request, Response } from "express";
import { supabase } from "../config/supabaseConfig";
import {
  createProductDAL,
  deleteProductDAL,
  getAllProductsDAL,
  getProductByIdDal,
  getProductsByCategoryDAL,
  searchProductsDal,
  updateProductDAL,
} from "../Dal/productDal";

/* =====================================================
   CATEGORY TREE (BACKEND AUTHORITY)
   ===================================================== */

const CATEGORY_TREE = {
  rice: ["basmati", "non_basmati"],

  grains_cereals: ["grains", "cereals"],

  clothing: {
    women: ["tops", "bottomwear", "footwear"],
    men: ["shirts", "bottomwear", "footwear"],
  },

  electronics: ["consumer", "industrial"],
};


type Unit = "KG" | "UNIT";

const getUnitsByGroup = (group: string): {
  priceUnit: Unit;
  quantityUnit: Unit;
} => {
  if (group === "rice" || group === "grains_cereals") {
    return {
      priceUnit: "KG",
      quantityUnit: "KG",
    };
  }

  return {
    priceUnit: "UNIT",
    quantityUnit: "UNIT",
  };
};

/* =====================================================
   CATEGORY VALIDATION
   ===================================================== */

const isValidCategory = (
  group: string,
  type: string,
  subType: string | null
): boolean => {
  const node = (CATEGORY_TREE as any)[group];
  if (!node) return false;

  // simple group -> type (rice, electronics)
  if (Array.isArray(node)) {
    return node.includes(type) && subType === null;
  }

  // clothing case
  if (typeof node === "object") {
    const subTypes = node[type];
    if (!subTypes) return false;
    return subType ? subTypes.includes(subType) : false;
  }

  return false;
};

/* =====================================================
   CREATE PRODUCT (ADMIN)
   ===================================================== */

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, description, quantity } = req.body;

    const group =
      typeof req.body.group === "string" ? req.body.group : undefined;
    const type =
      typeof req.body.type === "string" ? req.body.type : undefined;
    const subType =
      typeof req.body.subType === "string" ? req.body.subType : null;

    if (!name || !price || !description || !group || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!isValidCategory(group, type, subType)) {
      return res.status(400).json({
        message: "Invalid category combination",
      });
    }

    /* ===== IMAGE UPLOAD ===== */
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Images required" });
    }

    const imageUrls: string[] = [];

    for (const file of files) {
      const fileName = `products/${Date.now()}-${file.originalname}`;

      const { data: uploadData, error: uploadError } =
  await supabase.storage
    .from("products")
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
    });

console.log("UPLOAD DATA:", uploadData);
console.log("UPLOAD ERROR:", uploadError);

if (uploadError) {
  return res.status(500).json({
    message: "Image upload failed",
    error: uploadError.message,
  });
}

      const { data } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);

      imageUrls.push(data.publicUrl);
    }

    // ✅ AUTO UNITS
    const { priceUnit, quantityUnit } = getUnitsByGroup(group);

    const product = await createProductDAL({
      name,
      price: Number(price),
      priceUnit,               // ✅ AUTO
      quantity: quantity ? Number(quantity) : 0,
      quantityUnit,            // ✅ AUTO
      images: imageUrls,
      description: JSON.parse(description),
      category: { group, type, subType },
    });

    return res.status(201).json({
      success: true,
      product,
    });
  } catch (error: any) {
    console.error("CREATE PRODUCT ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};

// export const createProduct = async (req: Request, res: Response) => {
//   try {
//     const files = req.files as Express.Multer.File[];

//     if (!files || files.length === 0) {
//       return res.status(400).json({ message: "Images required" });
//     }

//     // 🔍 NETWORK CHECK
//     const { data: buckets, error: bucketError } =
//       await supabase.storage.listBuckets();

//     console.log("BUCKETS:", buckets);
//     if (bucketError) {
//       return res.status(500).json({ error: bucketError.message });
//     }

//     const imageUrls: string[] = [];

//     for (const file of files) {
//       const fileName = `product-images/${crypto.randomUUID()}-${file.originalname}`;

//       const { error: uploadError } =
//         await supabase.storage
//           .from("products")
//           .upload(fileName, file.buffer, {
//             contentType: file.mimetype,
//           });

//       if (uploadError) {
//         return res.status(500).json({
//           message: "Upload failed",
//           error: uploadError.message,
//         });
//       }

//       const { data } = supabase.storage
//         .from("products")
//         .getPublicUrl(fileName);

//       imageUrls.push(data.publicUrl);
//     }

//     return res.status(201).json({
//       success: true,
//       images: imageUrls,
//     });
//   } catch (error: any) {
//     console.error("CREATE PRODUCT ERROR:", error);
//     return res.status(500).json({ error: error.message });
//   }
// };


/* =====================================================
   GET ALL PRODUCTS
   ===================================================== */

export const getAllProducts = async (_: Request, res: Response) => {
  try {
    console.time("TOTAL_API");

    console.time("DAL_CALL");
    const products = await getAllProductsDAL();
    console.timeEnd("DAL_CALL");

    console.time("RESPONSE_SEND");
    res.json({ success: true, products });
    console.timeEnd("RESPONSE_SEND");

    console.timeEnd("TOTAL_API");
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


/* =====================================================
   GET PRODUCTS BY CATEGORY (USER SIDE)
   ===================================================== */

export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    console.time("TOTAL_API");

    console.time("QUERY_PARSE");
    const group =
      typeof req.query.group === "string" ? req.query.group : undefined;
    const type =
      typeof req.query.type === "string" ? req.query.type : undefined;
    const subType =
      typeof req.query.subType === "string" ? req.query.subType : undefined;
    console.timeEnd("QUERY_PARSE");

    console.time("DAL_CALL");
    const products = await getProductsByCategoryDAL(
      group,
      type,
      subType ?? null
    );
    console.timeEnd("DAL_CALL");

    console.time("RESPONSE_SEND");
    res.json({ success: true, products });
    console.timeEnd("RESPONSE_SEND");

    console.timeEnd("TOTAL_API");
  } catch (error) {
    console.error("getProductsByCategory error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =====================================================
   UPDATE PRODUCT (ADMIN)
   ===================================================== */

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const productId =
      typeof req.params.productId === "string"
        ? req.params.productId
        : undefined;

    if (!productId) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    const {
      name,
      price,
      quantity,
      description,
      group,
      type,
      subType,
    } = req.body;

    // ✅ CATEGORY VALIDATION
    if (group && type && !isValidCategory(group, type, subType || null)) {
      return res.status(400).json({
        message: "Invalid category combination",
      });
    }

    const updateData: any = {};

    /* ================= FIELD UPDATES ================= */

    if (name?.trim()) updateData.name = name.trim();
    if (price !== undefined && price !== "") updateData.price = Number(price);
    if (quantity !== undefined && quantity !== "")
      updateData.quantity = Number(quantity);

    if (description) {
      updateData.description =
        typeof description === "string"
          ? JSON.parse(description)
          : description;
    }

    if (group && type) {
      const { priceUnit, quantityUnit } = getUnitsByGroup(group);

      updateData.category = {
        group,
        type,
        subType: subType || null,
      };
      updateData.priceUnit = priceUnit;
      updateData.quantityUnit = quantityUnit;
    }

    /* ================= IMAGE REPLACE (SUPABASE) ================= */

    if (req.file) {
      // 1️⃣ Fetch existing product
      const existingProduct = await getProductByIdDal(productId);

      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      // 2️⃣ Delete old image from Supabase
      const oldImageUrl = existingProduct.images?.[0];

      if (oldImageUrl) {
        try {
          // Extract path after /products/
          const parts = oldImageUrl.split("/products/");
          const filePath = parts[1]; // e.g. products/123-image.jpg

          if (filePath) {
            const { error } = await supabase.storage
              .from("products")
              .remove([filePath]);

            if (error) {
              console.error("OLD IMAGE DELETE ERROR:", error);
            }
          }
        } catch (err) {
          console.warn("Failed to delete old image:", err);
        }
      }

      // 3️⃣ Upload new image
      const newFileName = `products/${Date.now()}-${req.file.originalname}`;

      await supabase.storage
        .from("products")
        .upload(newFileName, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      const { data } = supabase.storage
        .from("products")
        .getPublicUrl(newFileName);

      // 4️⃣ Replace images array
      updateData.images = [data.publicUrl];
    }

    /* ================= NOTHING TO UPDATE ================= */

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "No fields provided for update",
      });
    }

    /* ================= UPDATE ================= */

    const updatedProduct = await updateProductDAL(productId, updateData);

    if (!updatedProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error: any) {
    console.error("UPDATE PRODUCT ERROR:", error);
    return res.status(500).json({
      error: error.message || "Internal Server Error",
    });
  }
};




/* =====================================================
   DELETE PRODUCT (ADMIN)
   ===================================================== */

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productId =
      typeof req.params.productId === "string"
        ? req.params.productId
        : undefined;

    if (!productId) {
      return res.status(400).json({
        message: "Invalid productId",
      });
    }

    // 1️⃣ Delete product from DB
    const product = await deleteProductDAL(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // 2️⃣ Delete images from Supabase
    const images: string[] = product.images || [];

    if (images.length > 0) {
      const filePaths = images.map((url) => {
        // extract path after /products/
        const parts = url.split("/products/");
        return parts[1]; // ex: products/123-image.jpg
      });

      const { error } = await supabase.storage
        .from("products")
        .remove(filePaths);

      if (error) {
        console.error("IMAGE DELETE ERROR:", error);
        // ⚠️ do NOT fail product delete if image delete fails
      }
    }

    return res.json({
      success: true,
      message: "Product and images deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE PRODUCT ERROR:", error);
    return res.status(500).json({
      error: error.message,
    });
  }
};


export const searchProductsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string" || q.length < 2) {
      return res.json([]); // ✅ return empty list
    }

    const products = await searchProductsDal(q);
    return res.json(products);
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({
      message: "Failed to search products",
    });
  }
};

/**
 * GET /product/:id
 */
// export const getProductByIdController = async (

//   req: Request,
//   res: Response
// ) => {
//   try {
//     const { id } = req.params;

//     const product = await getProductByIdDal(id);

//     if (!product) {
//       return res.status(404).json({
//         message: "Product not found",
//       });
//     }

//     return res.json(product);
//   } catch (error) {
//     console.error("Get product error:", error);
//     return res.status(500).json({
//       message: "Failed to fetch product",
//     });
//   }
// };




export const getProductByIdController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    const product = await getProductByIdDal(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.json(product);
  } catch (error) {
    console.error("Get product error:", error);
    return res.status(500).json({
      message: "Failed to fetch product",
    });
  }
};