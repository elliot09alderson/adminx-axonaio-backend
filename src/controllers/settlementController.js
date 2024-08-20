// import settlementModel from "../models/payin/settlement.js";  
// import payinTransactionModel from "../models/payin/payinTransaction.js";
// import merchantPayinPricingModel from '../models/payin/payinPricing.js';
// import moment from "moment-timezone";

// const offset = 5.5 * 60 * 60 * 1000; // Offset for Indian Standard Time (IST)


// const parseDate = (dateString) => {
//     const [day, month, year] = dateString.split('/').map(Number);
//     return new Date(year, month - 1, day);
// };

// export const calculateSettlement = async (req, res) => {
//     try {
//       const { merchantId, startDate, endDate } = req.body;
   
//       if (!merchantId || !startDate || !endDate) {
//         return res.status(400).json({
//           status: false,
//           error: "Merchant ID, start date, and end date are required",
//         });
//       }
   
//       // Convert startDate and endDate to Date objects
//       const start = parseDate(startDate);
//       const end = parseDate(endDate);
   
//       // Ensure endDate is greater than startDate
//       if (end <= start) {
//         return res.status(400).json({
//           status: false,
//           error: "End date must be greater than start date",
//         });
//       }
   
//       // Retrieve all transactions for the merchant within the specified date range
//       const transactions = await payinTransactionModel.find({
//         m_id: merchantId,
//         isSettled: false,
//         transaction_date: { $gte: start, $lte: end },
//         transaction_status: "captured",
//       });
   
//       if (transactions.length === 0) {
//         return res.status(404).json({
//           status: false,
//           error: "No transactions found for the specified period",
//         });
//       }
   
//       // Retrieve merchant pricing
//       const flatPricing = await merchantPayinPricingModel.findOne({
//         m_id: merchantId,
//         type: "flat",
//       });
//       const percentPricing = await merchantPayinPricingModel.findOne({
//         m_id: merchantId,
//         type: "percent",
//       });
   
//       if (!flatPricing && !percentPricing) {
//         return res
//           .status(404)
//           .json({ status: false, error: "No pricing found for the merchant" });
//       }
   
//       // Calculate settlement details
//       let totalVolume = 0;
//       let totalCount = transactions.length;
//       let successVolume = 0;
//       let successCount = 0;
//       let charges = 0;
   
//       transactions.forEach((transaction) => {
//         totalVolume += transaction.transaction_amount;
//         successVolume += transaction.transaction_amount;
//         successCount += 1;
   
//         let applicablePricing = null;
   
//         // Determine applicable pricing based on transaction amount
//         if (flatPricing) {
//           if (
//             transaction.transaction_amount >= flatPricing.min_range &&
//             transaction.transaction_amount < flatPricing.max_range
//           ) {
//             applicablePricing = flatPricing;
//           }
//         }
   
//         if (percentPricing) {
//           if (
//             transaction.transaction_amount >= percentPricing.min_range &&
//             transaction.transaction_amount < percentPricing.max_range
//           ) {
//             applicablePricing = percentPricing;
//           }
//         }
   
//         if (applicablePricing) {
//           let charge = 0;
//           switch (transaction.transaction_mode) {
//             case "NetBanking":
//               charge = applicablePricing.NetBanking || 0;
//               break;
//             case "UPI":
//               charge = applicablePricing.UPI || 0;
//               break;
//             case "CC":
//               charge = applicablePricing.CC || 0;
//               break;
//             case "DC":
//               charge = applicablePricing.DC || 0;
//               break;
//             case "Wallet":
//               charge = applicablePricing.Wallet || 0;
//               break;
//             case "UPI_Collect":
//               charge = applicablePricing.UPI_Collect || 0;
//               break;
//             default:
//               charge = 0;
//               break;
//           }
   
//           if (applicablePricing.type === "percent") {
//             charge = (transaction.transaction_amount * parseFloat(charge)) / 100;
//           } else if (applicablePricing.type === "flat") {
//             charge = parseFloat(charge);
//           }
   
//           charges += charge;
//         }
//       });
   
//       // Calculate GST
//       const gst = 0.18 * charges;
   
//       // Calculate net settlement
//       const netSettlement = successVolume - (charges + gst);
   
//       // Create a new settlement record
//       const newSettlement = {
//         successCount: successCount,
//         successVolume: successVolume,
//         totalCount: totalCount,
//         totalVolume: totalVolume,
//         tax: gst,
//         fees: charges,
//         settlementValue: netSettlement,
//         m_id: merchantId,
//       };
//       res.status(201).json({
//         status: true,
//         message: "Settlement calculated successfully",
//         data: newSettlement,
//       });
//     } catch (error) {
//       res.status(500).json({ status: false, error: error.message });
//     }
//   };
// /* ------------------- HERE IT WILL CREATE BULK SETTLEMENT ------------------ */
// export const createSettlement = async (req, res) => {
//     try {
//         const { merchantId, startDate, endDate } = req.body;
        
//         if (!merchantId || !startDate || !endDate) {
//             return res.status(400).json({ status: false, error: "Merchant ID, start date, and end date are required" });
//         }

//         // Convert startDate and endDate to Date objects
//         const start = parseDate(startDate);
//         const end = parseDate(endDate);

//         // Ensure endDate is greater than startDate
//         if (end <= start) {
//             return res.status(400).json({ status: false, error: "End date must be greater than start date" });
//         }

//         // Retrieve all transactions for the merchant within the specified date range
//         const transactions = await payinTransactionModel.find({
//             m_id: merchantId,
//             transaction_date: { $gte: start, $lte: end },
//             transaction_status: "captured",
//         });

//         if (transactions.length === 0) {
//             return res.status(404).json({ status: false, error: "No transactions found for the specified period" });
//         }

//         // Retrieve merchant pricing
//         const flatPricing = await merchantPayinPricingModel.findOne({ m_id: merchantId, type: "flat" });
//         const percentPricing = await merchantPayinPricingModel.findOne({ m_id: merchantId, type: "percent" });
        
//         if (!flatPricing && !percentPricing) {
//             return res.status(404).json({ status: false, error: "No pricing found for the merchant" });
//         }

//         // Calculate settlement details
//         let totalVolume = 0;
//         let totalCount = transactions.length;
//         let successVolume = 0;
//         let successCount = 0;
//         let charges = 0;

//         transactions.forEach(transaction => {
//             totalVolume += transaction.transaction_amount;
//             successVolume += transaction.transaction_amount;
//             successCount += 1;

//             let applicablePricing = null;

//             // Determine applicable pricing based on transaction amount
//             if (flatPricing) {
//                 if (transaction.transaction_amount >= flatPricing.min_range && transaction.transaction_amount < flatPricing.max_range) {
//                     applicablePricing = flatPricing;
//                 }
//             }

//             if (percentPricing) {
//                 if (transaction.transaction_amount >= percentPricing.min_range && transaction.transaction_amount < percentPricing.max_range) {
//                     applicablePricing = percentPricing;
//                 }
//             }

//             if (applicablePricing) {
//                 let charge = 0;
//                 switch (transaction.transaction_mode) {
//                     case "NetBanking":
//                         charge = applicablePricing.NetBanking || 0;
//                         break;
//                     case "UPI":
//                         charge = applicablePricing.UPI || 0;
//                         break;
//                     case "CC":
//                         charge = applicablePricing.CC || 0;
//                         break;
//                     case "DC":
//                         charge = applicablePricing.DC || 0;
//                         break;
//                     case "Wallet":
//                         charge = applicablePricing.Wallet || 0;
//                         break;
//                     case "UPI_Collect":
//                         charge = applicablePricing.UPI_Collect || 0;
//                         break;
//                     default:
//                         charge = 0;
//                         break;
//                 }

//                 if (applicablePricing.type === 'percent') {
//                     charge = (transaction.transaction_amount * parseFloat(charge)) / 100;
//                 } else if (applicablePricing.type === 'flat') {
//                     charge = parseFloat(charge);
//                 }

//                 charges += charge;
//             }
//         });

//         // Calculate GST
//         const gst = 0.18 * charges;

//         // Calculate net settlement
//         const netSettlement = successVolume - (charges + gst);

//         // Create a new settlement record
//         const newSettlement = new settlementModel({
//             settlementDate: new Date(),
//             partnerId: merchantId,
//             merchantName: transactions[0].transaction_username, // Assuming transaction_username is the merchant name
//             payeeVpa: transactions[0].transaction_contact, // Assuming transaction_contact is the VPA
//             cycle: "daily", // Assuming daily cycle, modify as needed
//             timeoutCount: 0,
//             timeoutVolume: 0,
//             successCount: successCount,
//             successVolume: successVolume,
//             totalCount: totalCount,
//             totalVolume: totalVolume,
//             total_tax: gst,
//             total_fees: charges,
//             chargeback: 0,
//             prevDayCreditAdj: 0,
//             netSettlement: netSettlement,
//             transferred: 0,
//             fundReleased: 0,
//             cutOff: 0,
//             difference: netSettlement, // Assuming difference as netSettlement, modify as needed
//             utrNo: "", // UTR Number, modify as needed
//             remarks: "", // Any remarks, modify as needed
//             m_id: merchantId,
//         });

//         await newSettlement.save();

//         res.status(201).json({ status: true, message: "Settlement created successfully", data: newSettlement });
//     } catch (error) {
//         res.status(500).json({ status: false, error: error.message });
//     }
// };

// /* ----------- HERE IT WILL CREATE THE SETTLEMENT TRANSACTION WISE ---------- */

// // export const createSettlement = async (req, res) => {
// //     try {
// //       const { merchantId, startDate, endDate } = req.body;
  
// //       if (!merchantId || !startDate || !endDate) {
// //         return res.status(400).json({
// //           status: false,
// //           error: "Merchant ID, start date, and end date are required",
// //         });
// //       }
  
// //       // Convert startDate and endDate to Date objects
// //       const start = parseDate(startDate);
// //       const end = parseDate(endDate);
  
// //       // Ensure endDate is greater than startDate
// //       if (end <= start) {
// //         return res.status(400).json({
// //           status: false,
// //           error: "End date must be greater than start date",
// //         });
// //       }
  
// //       // Retrieve all transactions for the merchant within the specified date range
// //       const transactions = await payinTransactionModel.find({
// //         m_id: merchantId,
// //         transaction_date: { $gte: start, $lte: end },
// //         transaction_status: "captured",
// //         isSettled: false,
// //       });
  
// //       if (transactions.length === 0) {
// //         return res.status(404).json({
// //           status: false,
// //           error: "No transactions found for the specified period",
// //         });
// //       }
  
// //       // Retrieve merchant pricing
// //       const flatPricing = await merchantPayinPricingModel.findOne({
// //         m_id: merchantId,
// //         type: "flat",
// //       });
// //       const percentPricing = await merchantPayinPricingModel.findOne({
// //         m_id: merchantId,
// //         type: "percent",
// //       });
  
// //       if (!flatPricing && !percentPricing) {
// //         return res
// //           .status(404)
// //           .json({ status: false, error: "No pricing found for the merchant" });
// //       }
// //       function generateSettlementId() {
// //         // Get today's date in YYYYMMDD format
// //         const today = format(new Date(), "yyyyMMdd");
  
// //         // Generate a random component
// //         const randomComponent = crypto.randomBytes(4).toString("hex");
  
// //         // Combine the date and the random component
// //         const settlementId = `${today}-${randomComponent}`;
  
// //         return settlementId;
// //       }
  
// //       const SBID = generateSettlementId();
  
// //       // Create settlement records for each transaction
// //       for (let transaction of transactions) {
// //         let applicablePricing = null;
          
// //         // Determine applicable pricing based on transaction amount
// //         if (flatPricing) {
// //           if (
// //             transaction.transaction_amount >= flatPricing.min_range &&
// //             transaction.transaction_amount < flatPricing.max_range
// //           ) {
// //             applicablePricing = flatPricing;
// //           }
// //         }
  
// //         if (percentPricing) {
// //           if (
// //             transaction.transaction_amount >= percentPricing.min_range &&
// //             transaction.transaction_amount < percentPricing.max_range
// //           ) {
// //             applicablePricing = percentPricing;
// //           }
// //         }
  
// //         if (applicablePricing) {
// //           let charge = 0;
// //           switch (transaction.transaction_mode) {
// //             case "NetBanking":
// //               charge = applicablePricing.NetBanking || 0;
// //               break;
// //             case "UPI":
// //               charge = applicablePricing.UPI || 0;
// //               break;
// //             case "CC":
// //               charge = applicablePricing.CC || 0;
// //               break;
// //             case "DC":
// //               charge = applicablePricing.DC || 0;
// //               break;
// //             case "Wallet":
// //               charge = applicablePricing.Wallet || 0;
// //               break;
// //             case "UPI_Collect":
// //               charge = applicablePricing.UPI_Collect || 0;
// //               break;
// //             default:
// //               charge = 0;
// //               break;
// //           }
  
// //           if (applicablePricing.type === "percent") {
// //             charge = (transaction.transaction_amount * parseFloat(charge)) / 100;
// //           } else if (applicablePricing.type === "flat") {
// //             charge = parseFloat(charge);
// //           }
  
// //           // Calculate GST
// //           const gst = 0.18 * charge;
  
// //           // Calculate net settlement
// //           const netSettlement = transaction.transaction_amount - (charge + gst);
  
// //           // Create a new settlement record
// //           const newSettlement = new settlementModel({
// //             SBID: SBID,
// //             settlementId: "",
// //             settlementDate: new Date(),
// //             partnerId: merchantId,
// //             merchantName: transaction.transaction_username, // Assuming transaction_username is the merchant name
// //             payeeVpa: transaction.transaction_contact, // Assuming transaction_contact is the VPA
// //             cycle: "daily", // Assuming daily cycle, modify as needed
// //             timeoutCount: 0,
// //             timeoutVolume: 0,
// //             successCount: 1,
// //             successVolume: transaction.transaction_amount,
// //             totalCount: 1,
// //             totalVolume: transaction.transaction_amount,
// //             total_tax: gst,
// //             total_fees: charge,
// //             chargeback: 0,
// //             prevDayCreditAdj: 0,
// //             netSettlement: netSettlement,
// //             transferred: 0,
// //             fundReleased: 0,
// //             cutOff: 0,
// //             difference: netSettlement, // Assuming difference as netSettlement, modify as needed
// //             utrNo: "", // UTR Number, modify as needed
// //             remarks: "", // Any remarks, modify as needed
// //             m_id: merchantId,
// //           });
// //           const todaysDate = moment()
// //             .tz("Asia/Kolkata")
// //             .format("YYYY-MM-DD HH:mm:ss");
// //           await payinTransactionModel.findOneAndUpdate(
// //             { transaction_id: transaction.transaction_id },
// //             { isSettled: true, settlementDate: todaysDate },
// //             { new: true, runValidators: false }
// //           );
  
// //           await newSettlement.save();
// //         }
// //       }
  
// //       res.status(201).json({
// //         status: true,
// //         message: "Settlements created successfully",
// //       });
// //     } catch (error) {
// //       res.status(500).json({ status: false, error: error.message });
// //     }
// //   };


// export const fetchSettlementByFilter = async (req, res) => {
//     try {
//         const { from, to } = req.query;
//         const merchantId = req.query.merchantId

//         if (!from || !to) {
//             return res.status(400).json({ error: "Both 'from' and 'to' dates are required", status: false });
//         }

//         const startDate = new Date(new Date(from).getTime() + offset);
//         const endDate = new Date(new Date(to).getTime() + offset);

//         // Fetch settlement data based on date range and merchant_employee
//         const settlementData = await settlementModel.find([
//             {
//                 $match: {
//                     settlementDate: {
//                         $gte: startDate,
//                         $lte: endDate,
//                     },
//                     partnerId: merchantId,
//                 },
//             },
//             {
//                 $project: {
//                     settlementDate: 1,
//                     merchantName: 1,
//                     payeeVpa: 1,
//                     cycle: 1,
//                     timeoutCount: 1,
//                     timeoutVolume: 1,
//                     successCount: 1,
//                     successVolume: 1,
//                     totalCount: 1,
//                     totalVolume: 1,
//                     total_tax: 1,
//                     total_fees: 1,
//                     chargeback: 1,
//                     prevDayCreditAdj: 1,
//                     netSettlement: 1,
//                     transferred: 1,
//                     fundReleased: 1,
//                     cutOff: 1,
//                     difference: 1,
//                     utrNo: 1,
//                     remarks: 1,
//                     _id: 0,
//                 },
//             },
//             {
//                 $project: {
//                     "Settlement Date": "$settlementDate",
//                     "Merchant Name": "$merchantName",
//                     "Payee VPA": "$payeeVpa",
//                     Cycle: "$cycle",
//                     "Timeout Count": "$timeoutCount",
//                     "Timeout Volume": "$timeoutVolume",
//                     "Success Count": "$successCount",
//                     "Success Volume": "$successVolume",
//                     "Total Count": "$totalCount",
//                     "Total Volume": "$totalVolume",
//                     "Total Tax": "$total_tax",
//                     "Total Fees": "$total_fees",
//                     Chargeback: "$chargeback",
//                     "Prev Day Credit Adj": "$prevDayCreditAdj",
//                     "Net Settlement": "$netSettlement",
//                     Transferred: "$transferred",
//                     "Fund Released": "$fundReleased",
//                     CutOff: "$cutOff",
//                     Difference: "$difference",
//                     UTRNumber: "$utrNo",
//                     Remarks: "$remarks",
//                 },
//             },
//         ]);

//         if (settlementData.length) {
//             res.status(200).json({status:true, message:"settlementData fetched successfully",data:settlementData});
//         } else {
//             res.status(404).json({ error: "No settlements found", status: false });
//         }
//     } catch (error) {
//         // console.error(error);
//         res.status(500).json({ status:false,message: error.message });
//     }
// };


import settlementModel from "../models/payin/settlement.js";
import payinTransactionModel from "../models/payin/payinTransaction.js";
import merchantPayinPricingModel from "../models/payin/payinPricing.js";
import moment from "moment-timezone";
import crypto from "crypto";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";

const offset = 5.5 * 60 * 60 * 1000; // Offset for Indian Standard Time (IST)

const parseDate = (dateString) => {
  const [day, month, year] = dateString.split("/").map(Number);
  return new Date(year, month - 1, day);
};

// -------------------- CREATE Settlement --------------------------
export const createSettlement = async (req, res) => {
  try {
    const { merchantId, startDate, endDate } = req.body;

    if (!merchantId || !startDate || !endDate) {
      return res.status(400).json({
        status: false,
        error: "Merchant ID, start date, and end date are required",
      });
    }

    // Convert startDate and endDate to Date objects

    // Ensure endDate is greater than startDate
    if (endDate <= startDate) {
      return res.status(400).json({
        status: false,
        error: "End date must be greater than start date",
      });
    }

    // Retrieve all transactions for the merchant within the specified date range
    const transactions = await payinTransactionModel.find({
      m_id: merchantId,
      transaction_date: { $gte: startDate, $lte: endDate },
      transaction_status: "captured",
      isSettled: false,
    });

    if (transactions.length === 0) {
      return res.status(404).json({
        status: false,
        error: "No transactions found for the specified period",
      });
    }

    // Retrieve merchant pricing
    const flatPricing = await merchantPayinPricingModel.findOne({
      m_id: merchantId,
      type: "flat",
    });
    const percentPricing = await merchantPayinPricingModel.findOne({
      m_id: merchantId,
      type: "percent",
    });

    if (!flatPricing && !percentPricing) {
      return res
        .status(404)
        .json({ status: false, error: "No pricing found for the merchant" });
    }

    function generateSettlementId() {
      // Generate a UUID
      const uniqueId = uuidv4();

      return uniqueId;
    }
    function generateSettlementBatchId() {
      // Get today's date in YYYYMMDD format
      const today = format(new Date(), "yyyyMMdd");

      // Generate a random component
      const randomComponent = crypto.randomBytes(4).toString("hex");

      // Combine the date and the random component
      const settlementId = `${today}-${randomComponent}`;

      return settlementId;
    }

    const SBID = generateSettlementBatchId();

    // Create settlement records for each transaction
    for (let transaction of transactions) {
      let applicablePricing = null;

      // Determine applicable pricing based on transaction amount
      if (flatPricing) {
        if (
          transaction.transaction_amount >= flatPricing.min_range &&
          transaction.transaction_amount < flatPricing.max_range
        ) {
          applicablePricing = flatPricing;
        }
      }

      if (percentPricing) {
        if (
          transaction.transaction_amount >= percentPricing.min_range &&
          transaction.transaction_amount < percentPricing.max_range
        ) {
          applicablePricing = percentPricing;
        }
      }

      if (applicablePricing) {
        let charge = 0;
        switch (transaction.transaction_mode) {
          case "NetBanking":
            charge = applicablePricing.NetBanking || 0;
            break;
          case "UPI":
            charge = applicablePricing.UPI || 0;
            break;
          case "CC":
            charge = applicablePricing.CC || 0;
            break;
          case "DC":
            charge = applicablePricing.DC || 0;
            break;
          case "Wallet":
            charge = applicablePricing.Wallet || 0;
            break;
          case "UPI_Collect":
            charge = applicablePricing.UPI_Collect || 0;
            break;
          default:
            charge = 0;
            break;
        }

        if (applicablePricing.type === "percent") {
          charge = (transaction.transaction_amount * parseFloat(charge)) / 100;
        } else if (applicablePricing.type === "flat") {
          charge = parseFloat(charge);
        }

        // Calculate GST
        const gst = 0.18 * charge;

        // Calculate net settlement
        const netSettlement = transaction.transaction_amount - (charge + gst);

        // Create a new settlement record
        const newSettlement = new settlementModel({
          SBID: SBID,
          settlementId: "sid_" + generateSettlementId(),
          settlementDate: new Date(),
          partnerId: merchantId,
          merchantName: transaction.transaction_username, // Assuming transaction_username is the merchant name
          payeeVpa: transaction.transaction_contact, // Assuming transaction_contact is the VPA
          cycle: "daily", // Assuming daily cycle, modify as needed
          timeoutCount: 0,
          timeoutVolume: 0,
          successCount: 1,
          successVolume: transaction.transaction_amount,
          totalCount: 1,
          totalVolume: transaction.transaction_amount,
          total_tax: gst,
          total_fees: charge,
          chargeback: 0,
          prevDayCreditAdj: 0,
          netSettlement: netSettlement,
          transferred: 0,
          fundReleased: 0,
          cutOff: 0,
          difference: netSettlement, // Assuming difference as netSettlement, modify as needed
          utrNo: "", // UTR Number, modify as needed
          remarks: "", // Any remarks, modify as needed
          m_id: merchantId,
        });
        const todaysDate = moment()
          .tz("Asia/Kolkata")
          .format("YYYY-MM-DD HH:mm:ss");
        await payinTransactionModel.findOneAndUpdate(
          { transaction_id: transaction.transaction_id },
          {
            isSettled: true,
            settlementDate: todaysDate,
            platform_charges: charge,
            goods_service_tax: gst,
          },
          { new: true, runValidators: false }
        );

        await newSettlement.save();
      }
    }

    res.status(201).json({
      status: true,
      message: "Settlements created successfully",
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

// ------------------ CALCULATE SETTLEMENT ---------------------------

export const calculateSettlement = async (req, res) => {
  try {
    const { merchantId, startDate, endDate } = req.body;

    if (!merchantId || !startDate || !endDate) {
      return res.status(400).json({
        status: false,
        error: "Merchant ID, start date, and end date are required",
      });
    }

    // Convert startDate and endDate to Date objects
    const start = startDate;
    const end = endDate;

    // Ensure endDate is greater than startDate
    if (end <= start) {
      return res.status(400).json({
        status: false,
        error: "End date must be greater than start date",
      });
    }

    // Retrieve all transactions for the merchant within the specified date range
    const transactions = await payinTransactionModel.find({
      m_id: merchantId,
      isSettled: false,
      transaction_date: { $gte: start, $lte: end },
      transaction_status: "captured",
    });

    if (transactions.length === 0) {
      return res.status(404).json({
        status: false,
        error: "No transactions found for the specified period",
      });
    }

    // Retrieve merchant pricing
    const flatPricing = await merchantPayinPricingModel.findOne({
      m_id: merchantId,
      type: "flat",
    });
    const percentPricing = await merchantPayinPricingModel.findOne({
      m_id: merchantId,
      type: "percent",
    });

    if (!flatPricing && !percentPricing) {
      return res
        .status(404)
        .json({ status: false, error: "No pricing found for the merchant" });
    }

    // Calculate settlement details
    let totalVolume = 0;
    let totalCount = transactions.length;
    let successVolume = 0;
    let successCount = 0;
    let charges = 0;

    transactions.forEach((transaction) => {
      totalVolume += transaction.transaction_amount;
      successVolume += transaction.transaction_amount;
      successCount += 1;

      let applicablePricing = null;

      // Determine applicable pricing based on transaction amount
      if (flatPricing) {
        if (
          transaction.transaction_amount >= flatPricing.min_range &&
          transaction.transaction_amount < flatPricing.max_range
        ) {
          applicablePricing = flatPricing;
        }
      }

      if (percentPricing) {
        if (
          transaction.transaction_amount >= percentPricing.min_range &&
          transaction.transaction_amount < percentPricing.max_range
        ) {
          applicablePricing = percentPricing;
        }
      }

      if (applicablePricing) {
        let charge = 0;
        switch (transaction.transaction_mode) {
          case "NetBanking":
            charge = applicablePricing.NetBanking || 0;
            break;
          case "UPI":
            charge = applicablePricing.UPI || 0;
            break;
          case "CC":
            charge = applicablePricing.CC || 0;
            break;
          case "DC":
            charge = applicablePricing.DC || 0;
            break;
          case "Wallet":
            charge = applicablePricing.Wallet || 0;
            break;
          case "UPI_Collect":
            charge = applicablePricing.UPI_Collect || 0;
            break;
          default:
            charge = 0;
            break;
        }

        if (applicablePricing.type === "percent") {
          charge = (transaction.transaction_amount * parseFloat(charge)) / 100;
        } else if (applicablePricing.type === "flat") {
          charge = parseFloat(charge);
        }

        charges += charge;
      }
    });

    // Calculate GST
    const gst = 0.18 * charges;

    // Calculate net settlement
    const netSettlement = successVolume - (charges + gst);

    // Create a new settlement record
    const newSettlement = {
      successCount: successCount,
      successVolume: successVolume,
      totalCount: totalCount,
      totalVolume: totalVolume,
      tax: gst,
      fees: charges,
      settlementValue: netSettlement,
      m_id: merchantId,
    };
    res.status(201).json({
      status: true,
      message: "Settlement calculated successfully",
      data: newSettlement,
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

// ------------------ FETCH SETTLEMENT ---------------------------
export const fetchSettlementByFilter = async (req, res) => {
  try {
    console.log(req.query);
    const { from, to } = req.query;
    const merchantId = req.query.merchantId;

    if (!from || !to) {
      return res.status(400).json({
        error: "Both 'from' and 'to' dates are required",
        status: false,
      });
    }

    // Fetch settlement data based on date range and merchant_employee
    const settlementData = await settlementModel.find({
      m_id: merchantId,
      createdAt: {
        $gte: from,
        $lte: to,
      },
    });

    if (settlementData.length) {
      res.status(200).json({
        status: true,
        message: "settlementData fetched successfully",
        data: settlementData,
      });
    } else {
      res.status(404).json({ error: "No settlements found", status: false });
    }
  } catch (error) {
    // console.error(error);
    res.status(500).json({ status: false, message: error.message });
  }
};
