import mongoose from "mongoose";

const UserDocDetailsSchema = new mongoose.Schema(
  {
    accountHolderName: { type: String },
    accountType: { type: String },
    accountNumber: { type: String },
    confirmAn: { type: String },
    ifscCode: { type: String },
    branchName: { type: String },
    companyName: { type: String },
    businessType: { type: String },
    businessCategory: { type: String },
    description: { type: String },
    website: { type: String },
    city: { type: String },
    state: { type: String },
    address: { type: String },
    pincode: { type: String },
    panNumber: { type: String },
    aadharVoterIdPassportDLNumber: { type: String },
    gstNumber: { type: String },
    cancelledCheque: { type: String },
    companyPan: { type: String },
    registrationCertificate: { type: String },
    panAttachment: { type: String },
    aadharVoterIdPassportAttachment: { type: String },
    cancelledChequeAttachment: { type: String },
    m_id: { type: String },
    r_id: { type: String },
    ra_id: { type: String },
  },
  { timestamps: true }
);
const userDocModel = mongoose.model("UserDocDetails", UserDocDetailsSchema);
export default userDocModel;
