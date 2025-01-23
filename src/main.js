import express from "express";
import morgan from "morgan";

import { connectDB } from "./utils/database.js";
import { errorMiddleware, logErrors } from "./utils/error.js";

import routerV1 from "./v1/routes.js";

export const createApp = (config) => {
  const app = express();

  connectDB();

  app.use(express.json({ limit: 52428800 }));
  app.use(express.urlencoded({ extended: false, limit: 52428800 }));

  if (config.env === "development") {
    app.use(morgan("dev"));
  }

  routerV1(app);

  app.get("/", (req, res) => {
    res.status(200).json({
      success: true,
    });
  });

  app.use(logErrors);
  app.use(errorMiddleware);

  return app;
};
