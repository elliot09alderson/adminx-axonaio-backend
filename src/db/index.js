import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`,{  useNewUrlParser: true,
        useUnifiedTopology: true,
        w: "majority",}
    )
    console.log(
      `\n Mongodb Connected !! DB HOST : ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};



