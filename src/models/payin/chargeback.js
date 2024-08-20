const mongoose = require("mongoose");

const chargebackSchema = new mongoose.Schema({

  transaction_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PayinTransaction"
  },
  chargeback_amount: {
    type: String,
    required: true
  },
  chargeback_type: {
    type: String,
    enum: ['retrieval', 'chargeback', 'pre_arbitration', 'arbitration', 'fraud'],
    required: true
  },
  chargeback_status: {
    type: String,
    enum: ['open', 'under_review', 'lost', 'won', 'closed', 'processed', 'processing'],
    required: true
  },
  chargeback_respond: {
    type: String
  },
  adjDate: String,
  adjType: String,
  remitter: String,
  beneficiary: String,
  txnDate: String,
  rrn: String,
  payee: String,
  txnAmount: Number,
  adjAmount: Number,
  reasonCode: String,
  remarks: String,
  upload: String,
  m_id: {
    type: String,
    ref: "User",
  },
},{timestamps:true});

module.exports = mongoose.model("PayinChargeback", chargebackSchema);
