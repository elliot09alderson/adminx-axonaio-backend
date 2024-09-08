import mongoose from "mongoose";
const apiKeySchema = new mongoose.Schema(
  {
    salt_key: {
      type: String,
      required: true,
    },
    mid_key: { type: String, required: true },
    secret_key: {
      type: String,
      required: true,
    },
    AES_key: {
      type: String,
      required: true,
    },
    m_id: {
      type: String,
      ref: "User",
    },
    api_id: String,
  },
  { timestamps: true }
);

export const testPayoutApiKey = mongoose.model(
  "TestPayoutApiKey",
  apiKeySchema
);
export const livePayoutApiKey = mongoose.model(
  "LivePayoutApiKey",
  apiKeySchema
);
