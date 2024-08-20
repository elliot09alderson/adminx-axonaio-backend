// token schema
import mongoose from "mongoose"
const merchantPricing = new mongoose.Schema(
  {
    m_id: String,
    type: { type: String, enum: ["percent", "flat"], required: true },
    min_range:String,
    max_range:String,
    NetBanking: String,
    UPI:String,
    CC: String,
    DC: String,
    Wallet: String,
    UPI_Collect: String,
    added_By: { type: mongoose.Schema.Types.ObjectId, ref: "admin",}
  },
  { timestamps: true }
);

const merchantPayinPricingModel = mongoose.model("MerchantPayinPricing", merchantPricing);
export default merchantPayinPricingModel;
