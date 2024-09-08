import mongoose from "mongoose";
const apiKeySchema = new mongoose.Schema(
  {
    salt_key: {
      type: String,
      required: true,
    },
    secret_key: {
      type: String,
      required: true,
    },
    AES_key: {
      type: String,
      required: true,
    },
    mid_key: {
      type: String,
      required: true,
    },
    m_id: {
      type: String,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const testPayinApiKey = mongoose.model("TestPayinApiKey", apiKeySchema);
export const livePayinApiKey = mongoose.model("LivePayinApiKey", apiKeySchema);
