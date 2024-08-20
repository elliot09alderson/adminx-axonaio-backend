import mongoose from "mongoose";
const payoutTransactionSchema = new mongoose.Schema({
    transaction_id: { type: String, required: true },
    m_id: { type: String, required: true , ref:"User"},
    reference_id: { type: String, required: true },
    utr: { type: String, required: true },
    payout_id: { type: String, required: true },
    ben_id: { type: String, required: true },
    payout_name: { type: String, required: true },
    payout_phone: { type: String, required: true },
    payout_email: { type: String, required: true },
    payout_upi: { type: String, required: true },
    payout_ifsc: { type: String, required: true },
    payout_bank_acc: { type: String, required: true },
    payout_amount: { type: Number, required: true },
    payout_mode: { type: String, required: true },
    payout_vendor: { type: String, required: true },
    status: { type: String, required: true },
    remarks: { type: String, required: false },
    purpose: { type: String, required: false },
    description: { type: String, required: false },
    payout_charges: { type: Number, required: false },
    payout_gst: { type: Number, required: false },
    payout_date: { type: Date, default:Date.now },
    update_date: { type: Date, default:Date.now },
    udf1: { type: String, required: false },
    udf2: { type: String, required: false },
    udf3: { type: String, required: false },
},{timestamps:true});

const payoutTransactionModel = mongoose.model('PayoutTransaction', payoutTransactionSchema);
export default payoutTransactionModel;
