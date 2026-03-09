import { sequelize } from "./db";
import User from "../Model/user";
import Admin from "../Model/Admin"
import Product from "../Model/Product"
import { setupAssociations }from "../Model/associated";
import Inquiry from "../Model/Inquiry";


setupAssociations();

export const syncTables = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");


await Admin.sync({ alter: true });
await Product.sync({ alter: true });
await Inquiry.sync({ alter: true });









    console.log("✅ All tables created/updated successfully");
  } catch (err) {
    console.error("❌ Error syncing tables:", err);
    throw err;
  }
};