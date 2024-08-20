// token schema
import mongoose from "mongoose";
const merchantPricing = new mongoose.Schema(
  {
    m_id: String,
    type: { type: String, enum: ["percent", "flat"], required: true },
    min_range: String,
    max_range: String,
    UPI: String,
    NEFT: String,
    IMPS: String,
    RTGS: String,
    Wallet: String,
    added_By: { type: mongoose.Schema.Types.ObjectId, ref: "admin" },
  },
  { timestamps: true }
);

const merchantPayoutPricingModel = mongoose.model(
  "MerchantPayoutPricing",
  merchantPricing
);
export default merchantPayoutPricingModel;
