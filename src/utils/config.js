import { config } from "dotenv";

config();

export const NODE_ENV = process.env.NODE_ENV || "production";
export const PORT = process.env.PORT || 4000;

export const JWT_SECRET_APP = process.env.SECRET_PASSWORD_APP;
export const JWT_REFRESH_SECRET_APP = process.env.REFRESH_SECRET_APP;

export const URL_DATABASE = process.env.MONGODB_DATABASE;
