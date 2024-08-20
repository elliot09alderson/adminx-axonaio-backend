const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    transaction_id: {
      type: String,
      required: true,
    },
    order_id: {
      type: String,
      required: true,
    },
    order_amount: {
      type: Number,
      required: true,
    },
    order_attempts: {
      type: Number,
      default: 0,
    },
    order_receipt: String,
    order_status: {
      type: String,
      enum: ["Paid", "Created", "Attempted"],
      default: "Created",
    },
    m_id: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PayinOrder", orderSchema);
