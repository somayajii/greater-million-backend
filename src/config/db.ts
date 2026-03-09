import { Sequelize } from "sequelize";

// Supabase Postgres connection
export const sequelize = new Sequelize(
  "postgres",                             // database name
  "postgres.yxfbgexhutixaptgvbum",       // username
  "GreaterMillions@1234",                           // password
  {
    host: "aws-1-ap-southeast-2.pooler.supabase.com", // host
    port: 6543,                                   // port
    dialect: "postgres",
    logging: false,
  }
);