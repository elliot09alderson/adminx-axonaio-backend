import express from "express";
import CookieParser from "cookie-parser";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";

// Resolve the absolute path to your environment file
const envPath = path.resolve("src/.env");
dotenv.config({ path: envPath });

import cors from "cors";
import { adminRouter } from "./routes/adminRoutes.js";
// import { subscriptionRouter } from "./routes/subscriptionRoute.js";
export const app = express();
console.log("cors", process.env.CORS_ORIGIN);
// app.use(
//   cors({
//     origin: process.env.CORS_ORIGIN,
//     credentials: true,
//   })
// );

app.use(
  cors({
    origin: [
      // `${process.env.CORS_ORIGIN}`,
      `${process.env.LOCAL_BACKEND}`,
      "http://localhost:5173/admin/login",
    ],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.json({ limit: "16kb" }));
// app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("../public"));
app.use(CookieParser());

// use Routes
app.use("/api/v1/admin", adminRouter);
// app.use("/api/v1/channel", subscriptionRouter);
