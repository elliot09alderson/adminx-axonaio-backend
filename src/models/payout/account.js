const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema({
  m_id: { type: String, required: true },
  bank_name: { type: String, required: true },
  account_holder_name: { type: String, required: true },
  account_number: { type: String, required: true, unique: true },
  ifsc_code: { type: String, required: true },
  account_id: { type: String, required: true, unique: true },
  vendor_id: { type: String, required: true },
  is_active: { type: Boolean, required: true, default:false }
});

module.exports = mongoose.model('Account', bankAccountSchema);

