import mongoose from "mongoose";
const TransactionSchema = new mongoose.Schema(
  {
    transaction_id: String,
    vendor_transaction_id: String,
    vendor_id: String,
    isSettled: { type: Boolean, default: false },
    settledDate: {
      type: String,
      default: null,
    },
    bank_ref_no: String,
    order_id: {
      type: String,
      ref: "PayinOrder",
    },

    transaction_response: String,
    transaction_method_id: {
      type: Number,
      required: true,
    },

    transaction_type: String,
    transaction_username: String,
    transaction_email: String,
    transaction_contact: String,
    transaction_amount: {
      type: Number,
      required: true,
    },
    transaction_status: {
      type: String,
      enum: [
        "initiated",
        "authorized",
        "captured",
        "refunded",
        "failed",
        "cancelled",
      ],
      default: "initiated",
    },
    transaction_mode: {
      type: String,
      enum: ["NetBanking", "UPI", "CC", "DC", "Wallet", "UPI_Collect"],
    },
    transaction_notes: String,
    transaction_description: String,
    axonaio_tax: {
      type: Number,
      default: 0.0,
    },
    goods_service_tax: {
      type: Number,
      default: 0.0,
    },
    adjustment_done: {
      type: String,
      enum: ["Y", "N"],
      default: "N",
    },
    transaction_date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    transaction_ip: String,
    udf1: String,
    udf2: String,
    udf3: String,
    udf4: String,
    udf5: String,
    m_id: {
      type: String,
    },
  },
  { timestamps: true }
);

const payinTransactionModel = mongoose.model(
  "PayinTransaction",
  TransactionSchema
);
export default payinTransactionModel;
