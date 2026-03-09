import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db";

class Product extends Model {
  public id!: string;
  public name!: string;
  public price!: number;
  public priceUnit!: "KG" | "UNIT"; // ✅ REQUIRED
  public images!: string[];
  public description!: string[];
  public category!: {
    group: string;   // rice | grains_cereals | clothing | electronics
    type: string;    // basmati | women | consumer | etc
    subType: string | null; // footwear | tops | null
  };
  public quantity!: number; // admin only
   public quantityUnit!: "KG" | "UNIT";
}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    priceUnit: {
  type: DataTypes.ENUM("KG", "UNIT"),
  allowNull: false,
},


    images: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },

    description: {
      type: DataTypes.JSON,
      allowNull: false,
    },

    category: {
      type: DataTypes.JSON, // TREE STRUCTURE
      allowNull: false,
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
     quantityUnit: {
      type: DataTypes.ENUM("KG", "UNIT"),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "products",
    timestamps: true,
  }
);

export default Product;
