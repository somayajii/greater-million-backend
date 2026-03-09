import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db";

class Inquiry extends Model {
  public id!: string;
  public productId!: string;
  public name!: string;
  public email!: string;
  public phone!: string;
  public message?: string;
  public status!: "NEW" | "CONTACTED" | "CLOSED";
}

Inquiry.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    productId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("NEW", "CONTACTED", "CLOSED"),
      defaultValue: "NEW",
    },
  },
  {
    sequelize,
    tableName: "inquiries",
    timestamps: true,
  }
);

export default Inquiry;
