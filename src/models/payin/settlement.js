import mongoose from "mongoose";

const settlementSchema = new mongoose.Schema({
  SBID: { type: String, default: "null" },
  settlementId: { type: String, required: true },
  settlementDate: { type: Date, required: true },
  partnerId: { type: String, required: true },
  merchantName: { type: String, required: false },
  payeeVpa: { type: String, required: false },
  cycle: { type: String },
  totalCount: { type: Number },
  totalVolume: { type: Number },
  total_tax: String,
  total_fees: String,
  chargeback: { type: Number },
  prevDayCreditAdj: { type: Number },
  netSettlement: { type: String },
  transferred: { type: Number },
  fundReleased: { type: Number },
  cutOff: { type: Number },
  difference: { type: String },
  utrNo: { type: String },
  remarks: { type: String },
  m_id: {
    type: String,
    ref: "User",
  },
},{timestamps:true});

const settlementModel = mongoose.model("PaySettlementIn", settlementSchema);

export default settlementModel;
