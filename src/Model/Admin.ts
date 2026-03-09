import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db";

class Admin extends Model {
  public id!: string;
  public email!: string;
  public password!: string;
    public role!: string;
}

Admin.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
      role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "admin",
    },
  },
  {
    sequelize,
    tableName: "admins",
    timestamps: true,
  }
);

export default Admin;
