import routingModel from '../models/routingModel.js';
import VendorBankModel from '../models/vendorModel.js';
import { Admin } from "../models/adminModel.js";


/* ------------  create a new routing entry ----------- */
export const createRouting = async (req, res) => {
  try {
    const { m_id, NetBanking, CC, DC, Wallet, UPI_Collect, UPI, NEFT, IMPS, RTGS, app_mode, upi } = req.body;
    const { _id } = req.user; // Assuming adminId is set in the middleware

    // Validate m_id
    if (!m_id) {
      return res.status(400).json({ status: false, error: "Merchant ID (m_id) is required" });
    }

    // Validate app_mode
    if (!app_mode || !["Payin", "Payout"].includes(app_mode)) {
      return res.status(400).json({ status: false, error: "Invalid app_mode. Must be 'Payin' or 'Payout'" });
    }

    // Validate and check if referenced banks exist
    const payinBankFields = { NetBanking, CC, DC, Wallet, UPI_Collect, upi };
    for (const [field, bankId] of Object.entries(payinBankFields)) {
      if (bankId && bankId !== "NA") {
        const bankExists = await VendorBankModel.findById(bankId);
        if (!bankExists) {
          return res.status(404).json({ status: false, error: `Bank ID for ${field} does not exist` });
        }
        if(bankExists.app_mode !=="Payin"){
            return res.status(404).json({ status: false, error: `Bank ID for ${field} does not exist` });
        }
      }
    }

    const payoutBankFields = { UPI, NEFT, IMPS, RTGS };
    for (const [field, bankId] of Object.entries(payoutBankFields)) {
      if (bankId && bankId !== "NA") {
        const bankExists = await VendorBankModel.findById(bankId);
        if (!bankExists) {
          return res.status(400).json({ status: false, error: `Bank ID for ${field} does not exist` });
        }
        if(bankExists.app_mode !=="Payout"){
            return res.status(404).json({ status: false, error: `Bank ID for ${field} does not exist` });
        }
      }
    }

    const routingData = {
        m_id:m_id,
        UPI: UPI,
        upi: upi,
        NetBanking:NetBanking,
        CC:CC,
        DC:DC,
        NEFT:NEFT,
        IMPS:IMPS,
        RTGS:RTGS,
        Wallet:Wallet,
        UPI_Collect:UPI_Collect,
        added_By: _id

    }
     const newRoute = await routingModel.updateOne( { m_id: m_id },
        routingData,
        { upsert: true })

    res.status(201).json({ message: "Route created successfully", data: newRoute });
  } catch (error) {
    res.status(500).json({ status:false,error: error.message });
  }
};

/* ------------------------------ previos code ------------------------------ */
// Controller function to get routing details for a merchant
// export const fetchRoutingData = async (req, res) => {
//     try {
//       const { merchantId } = req.params;
//       const {app_mode} = req.query

//           // Validate app_mode
//     if (!app_mode || !["Payin", "Payout"].includes(app_mode)) {
//         return res.status(400).json({ status: false, error: "Invalid app_mode. Must be 'Payin' or 'Payout'" });
//       }
//         // agar payin aya to netbanking,cc,dc,wallet,upicollect populate karna aur agr payout aya to upi,neft,imps,rtgs karna
//         // aur payin ka alag responce bhejo aur payout ka alag

//       const routingDetails = await routingModel.findOne({ m_id:merchantId })
//         .populate('NetBanking', 'bankName')
//         .populate('CC', 'bankName')
//         .populate('DC', 'bankName')
//         .populate('Wallet', 'bankName')
//         .populate('UPI_Collect', 'bankName')
//         .populate('UPI', 'bankName')
//         .populate('NEFT', 'bankName')
//         .populate('IMPS', 'bankName')
//         .populate('RTGS', 'bankName');
  
//       if (!routingDetails) {
//         return res.status(404).json({ status: false, error: "No routing details found for this merchant" });
//       }
//       // Transform the response to replace ObjectIds with bank names
//       const findAdminName = await Admin.findById(routingDetails.added_By)

//     const transformedDetails = {
//         _id: routingDetails._id,
//         m_id: routingDetails.m_id,
//         NetBanking: routingDetails.NetBanking ? routingDetails.NetBanking.bankName : 'NA',
//         CC: routingDetails.CC ? routingDetails.CC.bankName : 'NA',
//         DC: routingDetails.DC ? routingDetails.DC.bankName : 'NA',
//         Wallet: routingDetails.Wallet ? routingDetails.Wallet.bankName : 'NA',
//         UPI_Collect: routingDetails.UPI_Collect ? routingDetails.UPI_Collect.bankName : 'NA',
//         UPI: routingDetails.UPI ? routingDetails.UPI.bankName : 'NA',
//         NEFT: routingDetails.NEFT ? routingDetails.NEFT.bankName : 'NA',
//         IMPS: routingDetails.IMPS ? routingDetails.IMPS.bankName : 'NA',
//         RTGS: routingDetails.RTGS ? routingDetails.RTGS.bankName : 'NA',
//         // app_mode: routingDetails.app_mode,
//         added_By: findAdminName.first_name,
//         // createdAt: routingDetails.createdAt,
//         // updatedAt: routingDetails.updatedAt,
//         // __v: routingDetails.__v
//       };
  
//       res.status(200).json({ status: true, data: transformedDetails });
  
  
//     //   res.status(200).json({ status: true, data: routingDetails });
//     } catch (error) {
//       console.error("Error fetching routing details:", error);
//       res.status(500).json({ status:false,error: error.message });
//     }
//   };

/* ----------------- GET THE DETAILS ACCORDING TO BANK WISE ----------------- */

export const fetchRoutingData = async (req, res) => {
  try {
    const { merchantId } = req.params;
    const { app_mode } = req.query;

    // Validate app_mode
    if (!app_mode || !["Payin", "Payout"].includes(app_mode)) {
      return res.status(400).json({ status: false, error: "Invalid app_mode. Must be 'Payin' or 'Payout'" });
    }

    // Fetch routing details
    const routingDetails = await routingModel.findOne({ m_id: merchantId });

    if (!routingDetails) {
      return res.status(404).json({ status: false, error: "No routing details found for this merchant" });
    }

    // Determine fields to populate based on app_mode
    let fieldsToPopulate = [];
    if (app_mode === "Payin") {
      fieldsToPopulate = ['NetBanking', 'CC', 'DC', 'Wallet', 'UPI_Collect','upi'];
    } else if (app_mode === "Payout") {
      fieldsToPopulate = ['UPI', 'NEFT', 'IMPS', 'RTGS'];
    }

    // Populate the specified fields
    await routingDetails.populate(fieldsToPopulate.map(field => ({ path: field, select: 'bankName' })));

    // Transform the response to replace ObjectIds with bank names
    const findAdminName = await Admin.findById(routingDetails.added_By);

    const transformedDetails = {
    //   _id: routingDetails._id,
      m_id: routingDetails.m_id,
      added_By: findAdminName ? findAdminName.first_name : 'Unknown',
    };

    // Add populated bank names to the response
    fieldsToPopulate.forEach(field => {
      transformedDetails[field] = routingDetails[field] ? routingDetails[field].bankName : 'NA';
    });

    res.status(200).json({ status: true, data: transformedDetails });

  } catch (error) {
    // console.error("Error fetching routing details:", error);
    res.status(500).json({ status:false,error: error.message });
  }
};

