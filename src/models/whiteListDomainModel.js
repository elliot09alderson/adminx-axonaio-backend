import mongoose from "mongoose";

const WhiteListDomainSchema = new mongoose.Schema(
  {
    domain: { type: String },
    added_By: { type: mongoose.Schema.Types.ObjectId, ref: "admin" },
  },
  { timestamps: true }
);

const WhiteListDomainModel = mongoose.model(
  "DomainWhiteList",
  WhiteListDomainSchema
);

export default WhiteListDomainModel;
