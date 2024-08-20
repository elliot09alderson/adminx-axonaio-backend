import payinTransactionModel from '../models/payin/payinTransaction.js';
import settlementModel from '../models/payin/settlement.js';
import merchantPayinPricingModel from '../models/payin/payinPricing.js';
import User from '../models/user.js'; 

const calculateSettlement = async (date) => {
  try {
    // Fetch all transactions for the given date
    const transactions = await payinTransactionModel.find({
      transaction_date: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      },
      transaction_status: 'captured', // Only consider captured transactions
    });

    // Group transactions by merchant
    const settlements = transactions.reduce((acc, transaction) => {
      const { m_id, transaction_amount, transaction_mode } = transaction;
      if (!acc[m_id]) {
        acc[m_id] = {
          m_id,
          totalAmount: 0,
          totalCharges: 0,
          transactions: [],
          timeoutCount: 0,
          timeoutVolume: 0,
          successCount: 0,
          successVolume: 0,
          chargeback: 0,
        };
      }
      acc[m_id].totalAmount += transaction_amount;
      acc[m_id].transactions.push(transaction);

      if (transaction.transaction_status === 'timeout') {
        acc[m_id].timeoutCount += 1;
        acc[m_id].timeoutVolume += transaction_amount;
      } else if (transaction.transaction_status === 'captured') {
        acc[m_id].successCount += 1;
        acc[m_id].successVolume += transaction_amount;
      }

      // Add logic to calculate chargeback if needed
      // if (transaction.transaction_status === 'chargeback') {
      //   acc[m_id].chargeback += transaction_amount;
      // }

      return acc;
    }, {});

    // Calculate settlement for each merchant
    for (const merchantId in settlements) {
      const { totalAmount, transactions, timeoutCount, timeoutVolume, successCount, successVolume, chargeback } = settlements[merchantId];

      // Fetch merchant pricing
      const merchantPricing = await merchantPayinPricingModel.findOne({ m_id: merchantId });
      if (!merchantPricing) {
        throw new Error(`Pricing details not found for merchant: ${merchantId}`);
      }

      // Fetch merchant details
      const merchantDetails = await User.findOne({ m_id: merchantId });
      if (!merchantDetails) {
        throw new Error(`Merchant details not found for merchant: ${merchantId}`);
      }

      let totalCharges = 0;

      // Calculate charges based on merchant pricing
      transactions.forEach(transaction => {
        const { transaction_amount, transaction_mode } = transaction;
        let charge = 0;
        switch (transaction_mode) {
          case 'UPI':
            charge = merchantPricing.UPI;
            break;
          case 'NetBanking':
            charge = merchantPricing.NetBanking;
            break;
          case 'CC':
            charge = merchantPricing.CC;
            break;
          case 'DC':
            charge = merchantPricing.DC;
            break;
          case 'Wallet':
            charge = merchantPricing.Wallet;
            break;
          case 'UPI_Collect':
            charge = merchantPricing.UPI_Collect;
            break;
          default:
            charge = 0;
        }

        // Apply the charge based on the pricing type (percent or flat)
        if (merchantPricing.type === 'percent') {
          charge = (transaction_amount * parseFloat(charge)) / 100;
        } else if (merchantPricing.type === 'flat') {
          charge = parseFloat(charge);
        }

        totalCharges += charge;
      });

      const gstAmount = totalCharges * 0.18; // 18% GST
      const netSettlement = totalAmount - totalCharges - gstAmount;

      // Save settlement to the database
      const settlement = new settlementModel({
        settlementDate: new Date(),
        partnerId: merchantId,
        merchantName: merchantDetails.name,
        payeeVpa: merchantDetails.payeeVpa,
        cycle: 'daily', // Example cycle, adjust as needed
        timeoutCount,
        timeoutVolume,
        successCount,
        successVolume,
        totalCount: transactions.length,
        totalVolume: totalAmount,
        charges: totalCharges,
        chargeback, // Set this based on your logic
        prevDayCreditAdj: 0, // Example value, adjust as needed
        netSettlement,
        transferred: 0, // Set this after processing the settlement
        fundReleased: 0, // Set this after processing the settlement
        cutOff: new Date().setHours(17, 0, 0, 0), // Example cutoff time, adjust as needed
        difference: 0, // Set this based on your logic
        utrNo: 'UTR123456789', // Example UTR number, generate as needed
        remarks: 'Settlement processed', // Example remarks, adjust as needed
        m_id: merchantId,
      });

      await settlement.save();
    }

    console.log('Settlements calculated successfully');
  } catch (error) {
    console.error('Error calculating settlements:', error);
  }
};

export default calculateSettlement;
