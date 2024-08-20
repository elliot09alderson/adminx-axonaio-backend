const mongoose = require('mongoose');

const beneficiarySchema = new mongoose.Schema({
  ben_id: { type: String, required: true },
  ben_name: { type: String, required: true },
  ben_mobile: { type: String, required: true },
  ben_email: { type: String, required: true },
  ben_address: { type: String, required: true },
  ben_state: { type: String, required: true },
  ben_pincode: { type: String, required: true },
  ben_upi: { type: String, required: true },
  ben_bank_acc: { type: String, required: true },
  ben_ifsc_code: { type: String, required: true },
  m_id: { type: String, required: true },
  is_active: { type: Boolean, required: true, default:false }
},{timestamps:true});

module.exports =  mongoose.model('Beneficiary', beneficiarySchema);
