import mongoose from "mongoose";
const webhookSchema = new mongoose.Schema(
  {
    webhook_url: {
      type: String,
    },
    m_id: {
      type: String,
      ref: "User",
    },
    webhook_id: String,
  },
  { timestamps: true }
);

export const testPayoutWebhook = mongoose.model(
  "TestPayoutWebhook",
  webhookSchema
);
export const livePayoutWebhook = mongoose.model(
  "LivePayoutWebhook",
  webhookSchema
);
