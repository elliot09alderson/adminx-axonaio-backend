import mongoose from "mongoose";

const WhiteListApiSchema = new mongoose.Schema(
  {
    ip: { type: String },
    added_By: { type: mongoose.Schema.Types.ObjectId, ref: "admin" },
  },
  { timestamps: true }
);

const WhiteListApiModel = mongoose.model("ApiWhiteList", WhiteListApiSchema);

export default WhiteListApiModel;
