import mongoose from "mongoose";
import { config } from "./config.js";

export const connectDB = async () => {
  try {
    if (!config.DATABASE) {
      console.error("Error: La URL de la base de datos no está configurada.");
      process.exit(1);
    }
    await mongoose.connect(config.DATABASE);

    if (config.NODE_ENV === "development") {
      console.log("Conectado DB");
    }
  } catch (error) {
    console.error("La conexión ha fallado:", error);
    process.exit(1);
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("Conexión DB finalizada");
  } catch (error) {
    console.error(error);
  }
};
