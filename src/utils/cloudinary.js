import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
console.log("cloudinary", process.env.CLOUDINARY_CLOUD_NAME);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const cloudInstance = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("file uploaded on cloudinary", cloudInstance.url);
    //_________Removing the server file__________
    fs.unlinkSync(localFilePath);
    // ____________________________________
    return cloudInstance;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    //remove the locally saved file
  }
};
