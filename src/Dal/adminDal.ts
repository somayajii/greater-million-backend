import Admin from "../Model/Admin";

export const createAdminDAL = async (
  email: string,
  password: string,
  role: string
) => {
  const admin = await Admin.create({
    email,
    password,
    role,
  });

  return admin;
};


export const getAdminByEmailDAL = async (email: string) => {
  return await Admin.findOne({ where: { email } });
};

export const comparePasswordDAL = (
  inputPassword: string,
  admin: any
) => {
  const dbPassword = admin.getDataValue("password");

  console.log("Comparing passwords:", {
    inputPassword,
    dbPassword,
  });

  return inputPassword === dbPassword;
};


export const getAdminProfileDAL = async (adminId: string) => {
  return await Admin.findByPk(adminId, {
    attributes: ["id", "email", "role","createdAt", "updatedAt"],
  });
};