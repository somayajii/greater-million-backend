
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { sequelize } from "./config/db";
import { syncTables } from "./config/SyncDb";
import adminRoute from "./Route/adminRoute";
import productRoute from "./Route/productRoute";
import inquiryRoute from "./Route/inquiryRoute";
import ImageRouter from "./Route/imageRoute"

import fetch from "node-fetch";
import { supabase } from "./config/supabaseConfig";











const app = express();
app.use(cors());
app.use(express.json()); // ✅ VERY IMPORTANT (you have this)

app.get("/supabase-test", async (req, res) => {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    console.log("TEST RESULT:", data, error);
    res.json({ data, error });
  } catch (err) {
    console.error("TEST FAILED:", err);
    res.status(500).json({ error: "Connection failed" });
  }
});

// console.log(supabase)
// Call syncTables() here
syncTables()
  .then(() => console.log("✅ Tables synced successfully"))
  .catch((err) => console.error("❌ Error syncing tables:", err));




app.use("/api/admin", adminRoute);
app.use("/api/product", productRoute);
app.use("/api/inquiry", inquiryRoute);
app.use("/api/image", ImageRouter);






const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));