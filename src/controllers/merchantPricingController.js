import merchantPayinPricingModel from "../models/payin/payinPricing.js";
import merchantPayoutPricingModel from "../models/payout/payoutPricing.js";
import { Admin } from "../models/adminModel.js";

// Function to set pricing for a merchant for payin
export const set_payin_pricing = async (req, res) => {
  try {
    const { type, min_range, max_range, NetBanking, UPI, CC, DC, Wallet, UPI_Collect } = req.body;
    const merchantId = req.params.merchantId;
    const { _id } = req.user; // Assuming adminId is set in the middleware

    // Check if type is valid
    if (!type || (type !== "flat" && type !== "percent")) {
      return res.status(400).json({ status: false, error: "Invalid type. Must be 'flat' or 'percent'." });
    }

    const pricingData = {
      type: type,
      min_range: min_range,
      max_range: max_range,
      NetBanking: NetBanking,
      UPI:UPI,
      CC: CC,
      DC: DC,
      Wallet: Wallet,
      UPI_Collect: UPI_Collect,
      added_By: _id
    };

    let query;
    if (type === "flat") {
      // Check if flat pricing already exists for this merchant
      query = await merchantPayinPricingModel.findOne({ m_id: merchantId, type: "flat" });
    } else if (type === "percent") {
      // Check if percent pricing already exists for this merchant
      query = await merchantPayinPricingModel.findOne({ m_id: merchantId, type: "percent" });
    }

    if (query) {
      // If pricing exists, update it
      const updatedPricing = await merchantPayinPricingModel.updateOne(
        { m_id: merchantId, type: type },
        { $set: pricingData }
      );
      return res.status(200).json({ status: true, message: `${type.charAt(0).toUpperCase() + type.slice(1)} pricing updated successfully`, data: updatedPricing });
    } else {
      // If pricing does not exist, create new
      const newPricing = new merchantPayinPricingModel({ ...pricingData, m_id: merchantId });
      await newPricing.save();
      return res.status(201).json({ status: true, message: `${type.charAt(0).toUpperCase() + type.slice(1)} pricing set successfully`, data: newPricing });
    }

  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

/* -------------------------------------------------------------------------- */
/*                                PREVIOUS CODE                               */
/* -------------------------------------------------------------------------- */

// Function to get pricing for a specific merchant
// export const getPayinPricing = async (req, res) => {
//   try {
//     const merchantId = req.params.merchantId;
//     const pricing = await merchantPayinPricingModel.find({ m_id:merchantId });
//     // console.log(pricing)
//     if (!pricing) {
//       return res.status(404).json({ status: false, error: "no records found" });
//     }

//     const findAdminName = await Admin.findById(pricing.added_By)
//     console.log(findAdminName)

//     // Pick only the desired keys
//     const selectedPricing = {
//       merchantId: pricing.m_id,
//       type: pricing.type,
//       min_range: pricing.min_range,
//       max_range: pricing.max_range,
//       UPI: pricing.UPI,
//       NetBanking: pricing.NetBanking,
//       CC: pricing.CC,
//       DC: pricing.DC,
//       Wallet: pricing.Wallet,
//       UPI_Collect: pricing.UPI_Collect,
//       updatedAt:pricing.updatedAt,
//       createdAt:pricing.createdAt,
//       added_By: findAdminName.first_name
//     };

//     res.status(200).json({ status: true, data: selectedPricing });
//   } catch (error) {
//     res.status(500).json({ status: false, error: error.message });
//   }
// };

export const getPayinPricing = async (req, res) => {
  try {
    const merchantId = req.params.merchantId;
    const pricingRecords = await merchantPayinPricingModel.find({ m_id: merchantId });

    if (!pricingRecords || pricingRecords.length === 0) {
      return res.status(404).json({ status: false, error: "No records found" });
    }

    const pricingWithAdminNames = await Promise.all(
      pricingRecords.map(async (pricing) => {
        const admin = await Admin.findById(pricing.added_By).select('first_name');

        return {
          merchantId: pricing.m_id,
          type: pricing.type,
          min_range: pricing.min_range,
          max_range: pricing.max_range,
          UPI: pricing.UPI,
          NetBanking: pricing.NetBanking,
          CC: pricing.CC,
          DC: pricing.DC,
          Wallet: pricing.Wallet,
          UPI_Collect: pricing.UPI_Collect,
          updatedAt: pricing.updatedAt,
          createdAt: pricing.createdAt,
          added_By: admin ? admin.first_name : "Admin not found",
        };
      })
    );

    res.status(200).json({ status: true, message:"fetched successfully",  data: pricingWithAdminNames });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};


// Function to set pricing for a merchant for payout
export const set_payout_pricing = async (req, res) => {
  try {
    const { type, min_range, max_range, UPI, neft, rtgs, imps, Wallet } = req.body;
    const merchantId = req.params.merchantId
    const { _id } = req.user; // Assuming adminId is set in the middleware
    
        // Check if type is valid
        if (!type || (type !== "flat" && type !== "percent")) {
          return res.status(400).json({ status: false, error: "Invalid type. Must be 'flat' or 'percent'." });
        }

    const pricingData = {
        type:type,
        min_range:min_range,
        max_range:max_range,
        UPI:UPI,
        NEFT:neft,
        IMPS:imps,
        RTGS:rtgs,
        Wallet:Wallet,
        added_By: _id

    }
    let query;
    if (type === "flat") {
      // Check if flat pricing already exists for this merchant
      query = await merchantPayoutPricingModel.findOne({ m_id: merchantId, type: "flat" });
    } else if (type === "percent") {
      // Check if percent pricing already exists for this merchant
      query = await merchantPayoutPricingModel.findOne({ m_id: merchantId, type: "percent" });
    }

    if (query) {
      // If pricing exists, update it
      const updatedPricing = await merchantPayoutPricingModel.updateOne(
        { m_id: merchantId, type: type },
        { $set: pricingData }
      );
      return res.status(200).json({ status: true, message: `${type.charAt(0).toUpperCase() + type.slice(1)} pricing updated successfully`, data: updatedPricing });
    } else {
      // If pricing does not exist, create new
      const newPricing = new merchantPayoutPricingModel({ ...pricingData, m_id: merchantId });
      await newPricing.save();
      return res.status(201).json({ status: true, message: `${type.charAt(0).toUpperCase() + type.slice(1)} pricing set successfully`, data: newPricing });
    }
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

// Function to get pricing for a specific merchant
export const getPayoutPricing = async (req, res) => {
  try {
    const merchantId = req.params.merchantId;
    const pricingRecords = await merchantPayoutPricingModel.find({ m_id: merchantId });

    if (!pricingRecords || pricingRecords.length === 0) {
      return res.status(404).json({ status: false, error: "No records found" });
    }

    const pricingWithAdminNames = await Promise.all(
      pricingRecords.map(async (pricing) => {
        const admin = await Admin.findById(pricing.added_By).select('first_name');
        return {
          merchantId: pricing.m_id,
          type: pricing.type,
          min_range: pricing.min_range,
          max_range: pricing.max_range,
          UPI: pricing.UPI,
          NEFT: pricing.NEFT,
          IMPS: pricing.IMPS,
          RTGS: pricing.RTGS,
          Wallet: pricing.Wallet,
          added_By: admin ? admin.first_name : "Admin not found"
        };
      })
    );

    res.status(200).json({ status: true, message:"fetched successfully", data: pricingWithAdminNames });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

