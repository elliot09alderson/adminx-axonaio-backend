import dotenv from "dotenv";
import path from "path";

// Resolve the absolute path to your environment file
const envPath = path.resolve("src/.env");
dotenv.config({ path: envPath });

// __________CLOUDINARY CONFIGS_________

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// _______________________________________

import { app } from "./app.js";
import { connectDB } from "./db/index.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8080, () => {
      console.log("server running on ", process.env.PORT);
    });
  })
  .catch((err) => {
    console.log(err.message);
  });
