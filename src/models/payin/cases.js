const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  m_id: { type: String, required: true, ref:"User" },
  case_id: { type: String, required: true, unique: true },
  reference_id: { type: String, required: true },
  UTR: { type: String, required: true },
  transaction_id: { type: String, required: true },
  case_from: { type: String, required: true },
  case_type: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  case_station: { type: String, required: true },
  station_officer_name: { type: String, required: true },
  case_station_email: { type: String, required: true },
  evidences: { type: [String], required: true },
  case_remark: { type: String },
  case_status: { type: String, required: true },
  case_date: { type: Date, required: true ,default:Date.now},
  case_closing_date: { type: Date, }
});

const Case = mongoose.model('PayinCase', caseSchema);

module.exports = Case;
