import payinTransactionModel from "../models/payin/payinTransaction.js"; 
import payoutTransactionModel from "../models/payout/payoutTransaction.js";


// export const dashBoardApis = async (req, res) => {
//     const { date, merchantId, appMode } = req.query;
    
//     try {
//       const dashboardData = await getDashboardData(date, merchantId, appMode);
//       res.status(200).json({status:true, message: "dashboard data fetched successfully", data:dashboardData});
//     } catch (error) {
//       res.status(500).json({ status: false, error: error.message });
//     }
//   }
  
//   const getDashboardData = async (date, merchantId, appMode) => {
//     const query = {
//       ...(date && { date: new Date(date) }),
//       ...(merchantId && { merchantId }),
//       ...(appMode && { appMode }),
//     };
  
//     let transactions = [];
    
//     if (appMode === 'Payin') {
//       transactions = await payinTransactionModel.find(query);
//     } else if (appMode === 'Payout') {
//       transactions = await payoutTransactionModel.find(query);
//     } else {
//       const payinTransactions = await payinTransactionModel.find(query);
//       const payoutTransactions = await payoutTransactionModel.find(query);
//       transactions = [...payinTransactions, ...payoutTransactions];
//     }
  
//     const numberOfRequests = transactions.length;
//     const successRequests = transactions.filter(tx => tx.status === 'success').length;
//     const failedRequests = transactions.filter(tx => tx.status === 'failed').length;
//     const droppedRequests = transactions.filter(tx => tx.status === 'dropped').length;
//     const successVolume = transactions.filter(tx => tx.status === 'success').reduce((total, tx) => total + tx.amount, 0);
//     const fees = transactions.reduce((total, tx) => total + (tx.fee || 0), 0);
//     const tax = transactions.reduce((total, tx) => total + (tx.tax || 0), 0);
//     const settlement = successVolume - fees - tax;
  
//     return {
//       numberOfRequests,
//       successRequests,
//       failedRequests,
//       droppedRequests,
//       successVolume,
//       fees,
//       tax,
//       settlement,
//     };
//   };
// [10:14] Pratik Verma
export const dashBoardApis = async (req, res) => {
  const { startUTC, endUTC, merchantId, appMode } = req.query;
  console.log(startUTC, endUTC, merchantId, appMode);
  try {
    const dashboardData = await getDashboardData(
      startUTC,
      endUTC,
      merchantId,
      appMode
    );
    res.status(200).json({
      status: true,
      message: "dashboard data fetched successfully",
      data: dashboardData,
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};
 
const getDashboardData = async (
  startUTC,
  endUTC,
  merchantId,
  appMode = "Payin"
) => {
  const query = {
    m_id: merchantId,
    appMode: appMode,
    date: {
      $gte: startUTC,
      $lte: endUTC,
    },
  };
  // const query = {
  //   ...(date && { date: new Date(date) }),
  //   ...(merchantId && { merchantId }),
  //   ...(appMode && { appMode }),
  // };
 
  let transactions = [];
 
  if (appMode === "Payin") {
    transactions = await payinTransactionModel.find(query);
  } else if (appMode === "Payout") {
    transactions = await payoutTransactionModel.find(query);
  } else {
    const payinTransactions = await payinTransactionModel.find(query);
    const payoutTransactions = await payoutTransactionModel.find(query);
    transactions = [...payinTransactions, ...payoutTransactions];
  }
 
  const numberOfRequests = transactions.length;
  const successRequests = transactions.filter(
    (tx) => tx.status === "success"
  ).length;
  const failedRequests = transactions.filter(
    (tx) => tx.status === "failed"
  ).length;
  const droppedRequests = transactions.filter(
    (tx) => tx.status === "dropped"
  ).length;
  const successVolume = transactions
    .filter((tx) => tx.status === "success")
    .reduce((total, tx) => total + tx.amount, 0);
  const fees = transactions.reduce((total, tx) => total + (tx.fee || 0), 0);
  const tax = transactions.reduce((total, tx) => total + (tx.tax || 0), 0);
  const settlement = successVolume - fees - tax;
 
  return {
    numberOfRequests,
    successRequests,
    failedRequests,
    droppedRequests,
    successVolume,
    fees,
    tax,
    settlement,
  };
};
 

 
 