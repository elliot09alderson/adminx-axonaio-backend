import payinTransactionModel from "../models/payin/payinTransaction.js"; 
import payoutTransactionModel from "../models/payout/payoutTransaction.js";

/* -------------------------------------------------------------------------- */
/*                              PAYIN TRANSACTION                             */
/* -------------------------------------------------------------------------- */

  export const getTodaysPayinTransaction = async (req, res) => {
    try {
      const merchantId = req.params.merchantId;
  
      // Get today's date
      const today = new Date();
      // Set the time to the beginning of the day (00:00:00)
      today.setHours(0, 0, 0, 0);
  
      // Get tomorrow's date
      const tomorrow = new Date(today);
      // Set the time to the end of the day (23:59:59)
      tomorrow.setDate(today.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);
  
      // Find transaction data for the current user within today's date range
      const TransactionsData = await payinTransactionModel.find({
        m_id: merchantId,
        createdAt: { $gte: today, $lte: tomorrow },
      }).sort({ createdAt: -1 });
  
      if (TransactionsData.length > 0) {
        res.status(200).json({ status: true, data: TransactionsData });
      } else {
        res.status(404).json({ status: false, error: "no records found" });
      }
    } catch (error) {
      res.status(500).json({ status:false,error: error.message });
    }
  };
  
  export const getPayinTransactionByDate = async (req, res) => {
    try {
        const merchantId = req.params.merchantId;
  
      // Extracting date filter parameters from the request query
      const { startDate, endDate } = req.query;
    //   console.log(startDate, endDate);
  
      // Validating the presence of startDate and endDate
      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ Error: "Both startDate and endDate are required" });
      }
  
      // // Parsing the date strings to Date objects and converting them to UTC
      // const start = new Date(startDate + "T00:00:00.000Z");
      // const end = new Date(endDate + "T23:59:59.999Z");
  
      const Transactions = await payinTransactionModel.find({
        m_id: merchantId,
        createdAt: { $gte: startDate, $lte: endDate },
      }).sort({ createdAt: -1 });
    //   console.log(Transactions);
      if (Transactions.length === 0) {
        return res.status(404).json({ status: false, error: "no records found" });
      }
  
      // Sending the Transactions as the API response
      res.status(200).json({ status: true, data: Transactions });
    } catch (error) {
        res.status(500).json({ status:false,error: error.message });
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                             PAYOUT TRANSACTION                             */
  /* -------------------------------------------------------------------------- */

  
  export const getTodaysPayoutTransaction = async (req, res) => {
    try {
      const merchantId = req.params.merchantId;
  
      // Get today's date
      const today = new Date();
      // Set the time to the beginning of the day (00:00:00)
      today.setHours(0, 0, 0, 0);
  
      // Get tomorrow's date
      const tomorrow = new Date(today);
      // Set the time to the end of the day (23:59:59)
      tomorrow.setDate(today.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);
  
      // Find transaction data for the current user within today's date range
      const TransactionsData = await payoutTransactionModel.find({
        m_id: merchantId,
        createdAt: { $gte: today, $lte: tomorrow },
      }).sort({ createdAt: -1 });
  
      if (TransactionsData.length > 0) {
        res.status(200).json({ status: true, data: TransactionsData });
      } else {
        res.status(404).json({ status: false, error: "no records found" });
      }
    } catch (error) {
      res.status(500).json({ status:false,error: error.message });
    }
  };
  
  export const getPayoutTransactionByDate = async (req, res) => {
    try {
        const merchantId = req.params.merchantId;
  
      // Extracting date filter parameters from the request query
      const { startDate, endDate } = req.query;
    //   console.log(startDate, endDate);
  
      // Validating the presence of startDate and endDate
      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ Error: "Both startDate and endDate are required" });
      }
  
      // // Parsing the date strings to Date objects and converting them to UTC
      // const start = new Date(startDate + "T00:00:00.000Z");
      // const end = new Date(endDate + "T23:59:59.999Z");
  
      const Transactions = await payoutTransactionModel.find({
        m_id: merchantId,
        createdAt: { $gte: startDate, $lte: endDate },
      }).sort({ createdAt: -1 });
    //   console.log(Transactions);
      if (Transactions.length === 0) {
        return res.status(404).json({ status: false, error: "no records found" });
      }
  
      // Sending the Transactions as the API response
      res.status(200).json({ status: true, data: Transactions });
    } catch (error) {
        res.status(500).json({ status:false,error: error.message });
    }
  };
