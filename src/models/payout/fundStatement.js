const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fundStatementSchema = new Schema({
  fund_id: { type: String, required: true },
  m_id: { type: String, required: true },
  reference_id: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  opening_balance: { type: Number, required: true },
  closing_balance: { type: Number, required: true },
  type: { type: String, required: true, enum: ['CR', 'DR'] }, // CR for Credit, DR for Debit
  utr: { type: String, required: true },
  remark: { type: String },
  va_id: { type: String }
});

const Transaction = mongoose.model('PayoutFundStatement', fundStatementSchema);

module.exports = Transaction;
