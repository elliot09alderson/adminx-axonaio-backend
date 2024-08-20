// token schema
import mongoose from "mongoose";
const Schema = mongoose.Schema;
const tokenSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: "12h", // this is the expiry time in seconds
    },
  },
  { timestamps: true }
);
const TokenModel = mongoose.model("Token", tokenSchema);
export default TokenModel;
