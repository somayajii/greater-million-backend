import { supabase } from "../config/supabaseConfig";
import { v4 as uuidv4 } from "uuid";

export const uploadImageToSupabase = async (
  file: Express.Multer.File
) => {
  try {
    const fileExt = file.originalname.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("product-images") // your bucket name
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (error) {
    throw error;
  }
};