import mongoose from "mongoose";

const VendorBankSchema = new mongoose.Schema({
  vendor_Id: String,

  bankName: {
    type: String,
    required: true,
    unique: false,
  },
  keys: [
    {
      keyName: {
        type: String,
        required: true,
      },
      value: {
        type: String,
      },
    },
  ],
  app_mode: { type: String, enum: ["Payin", "Payout"] },
  added_By: { type: mongoose.Schema.Types.ObjectId, ref: "admin",}

},{timestamps:true});

const VendorBankModel = mongoose.model("VendorBank", VendorBankSchema);

export default VendorBankModel;
