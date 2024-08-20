import mongoose from "mongoose";

const routingSchema = new mongoose.Schema(
  {
    m_id: { type: String, required: true },
    NetBanking: { type: mongoose.Schema.Types.ObjectId, ref: "VendorBank", default: null },
    CC: { type: mongoose.Schema.Types.ObjectId, ref: "VendorBank", default: null },
    DC: { type: mongoose.Schema.Types.ObjectId, ref: "VendorBank", default: null },
    Wallet: { type: mongoose.Schema.Types.ObjectId, ref: "VendorBank", default: null },
    UPI_Collect: { type: mongoose.Schema.Types.ObjectId, ref: "VendorBank", default: null },
    upi: { type: mongoose.Schema.Types.ObjectId, ref: "VendorBank", default: null },
    UPI: { type: mongoose.Schema.Types.ObjectId, ref: "VendorBank", default: null },
    NEFT: { type: mongoose.Schema.Types.ObjectId, ref: "VendorBank", default: null },
    IMPS: { type: mongoose.Schema.Types.ObjectId, ref: "VendorBank", default: null },
    RTGS: { type: mongoose.Schema.Types.ObjectId, ref: "VendorBank", default: null },
    // app_mode: { type: String, enum: ["Payin", "Payout"] },
    added_By: { type: mongoose.Schema.Types.ObjectId, ref: "admin" }
  },
  { timestamps: true }
);

const routingModel = mongoose.model("Route", routingSchema);
export default routingModel;
