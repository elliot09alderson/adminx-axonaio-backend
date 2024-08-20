const mongoose = require("mongoose");

const webhookSchema = new mongoose.Schema(
  {
    webhook_url: {
      type: String,
    },
    m_id: {
      type: String,
      ref: "User",
    },
    webhook_id : String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("WebhookOut", webhookSchema);
