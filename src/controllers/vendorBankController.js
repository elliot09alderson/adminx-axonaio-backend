import VendorBankModel from "../models/vendorModel.js";
import CryptoJS from "crypto-js";

// FUNCTION FOR GENERATE BankId
function generateBankId() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const minLength = 20;
  const maxLength = 24;
  const length =
    Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  let vendorId = "BA_";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    vendorId += characters.charAt(randomIndex);
  }

  return vendorId;
}

/* ----------------- HERE CREATING THE VENDOR BANKS AND KEYS ---------------- */
export const createVendorBank = async (req, res) => {
  try {
    const { bankName, keys } = req.body;
    const { _id } = req.user; // Assuming adminId is set in the middleware


    if (!bankName || !Array.isArray(keys) || keys.length === 0) {
      return res
        .status(400)
        .json({ status: false, error: "Please provide all the fields!" });
    }

    const { app_mode } = req.query;
    if (!["Payin", "Payout"].includes(app_mode)) {
      return res
        .status(400)
        .json({ status: false, error: "Invalid app_mode value" });
    }

   // Check if bank with the same name already exists
   const checkBankName = await VendorBankModel.find({ bankName: bankName });

   // Check if bank already exists in both modes
   const payinExists = checkBankName.some(bank => bank.app_mode === "Payin");
   const payoutExists = checkBankName.some(bank => bank.app_mode === "Payout");

   if (payinExists && payoutExists) {
     return res.status(409).json({ status: false, error: "This Bank already exists in both Payin and Payout modes" });
   }

     // Manually handle and validate the keys array
     if (!Array.isArray(keys) || keys.some(key => typeof key !== 'string')) {
      return res.status(400).json({ status: false, error: "Keys must be an array of strings" });
    }

    // Transform keys array to match schema
    const formattedKeys = keys.map(key => ({ keyName: key }));

   // Create a new vendor bank if it doesn't exist in the specified mode
   if ((app_mode === "Payin" && !payinExists) || (app_mode === "Payout" && !payoutExists)) {
     const newVendorBank = new VendorBankModel({ vendor_Id: generateBankId(),bankName, keys:formattedKeys, app_mode ,added_By: _id
     });
     await newVendorBank.save();
     return res.status(201).json({ message: "Vendor Bank created successfully", data: newVendorBank });
   } else {
     return res.status(409).json({ status: false, error: `This Bank already exists in ${app_mode} mode` });
   }


  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

/* --------------------- HERE WE ARE FETCHING THE VENDOR BANKS --------------------- */
export const getAllVendorBanksByFilter = async (req, res) => {
  try {
    const { app_mode } = req.query;
    if (!["Payin", "Payout"].includes(app_mode)) {
      return res
        .status(400)
        .json({ status: false, error: "Invalid app_mode value" });
    }
    let filter = {};
    if (app_mode && ["Payin", "Payout"].includes(app_mode)) {
      filter.app_mode = app_mode;
    }

    const vendorBanks = await VendorBankModel.find(filter).select(" -keys").populate("added_By", "first_name");
    if (vendorBanks.length == 0) {
      return res.status(404).json({ status: false, error: "no records found" });
    }
    // console.log(vendorBanks);

    res.status(200).json({
      status: true,
      message: "fetched successfully",
      data: vendorBanks,
    });
  } catch (error) {
    res.status(500).json({ status:false,error: error.message });
  }
};

/* -------------------- HERE FETCHING THE KEYS BANK WISE -------------------- */

// export const getKeysCount = async (req, res) => {
//   try {
//     const { vendorId } = req.params;
//     console.log(vendorId);
//     const bankDetails = await VendorBankModel.findOne({ vendor_Id: vendorId });
//     console.log(bankDetails);
//     if (!bankDetails) {
//       return res.status(404).json({ status: false, error: "no records found" });
//     }
//     const keysCount = bankDetails.keys;
//     res.status(200).json({ status: true, data: keysCount });
//   } catch (error) {
//     res.status(500).json({ status:false,error: error.message });
    
//   }
// };


export const getKeysCount = async (req, res) => {
  try {

    const { vendorId } = req.params;


    if (!vendorId) {
      return res
        .status(400)
        .json({ status: false, error: "Please provide a bank name" });
    }

    const vendorBank = await VendorBankModel.findOne({ vendor_Id: vendorId});

    if (!vendorBank) {
      return res
        .status(404)
        .json({ status: false, message: "Bank not found" });
    }

    const keys = vendorBank.keys.map(key => key.keyName);

    return res.status(200).json({ status: true, message:"fetched keys successfully", data:keys });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};
/* ---------------------- HERE INSERT THE VALUES OF KEY --------------------- */

export const insertValues = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { keys } = req.body; // Expecting an array of keys with values

    // Validate vendorId
    if (!vendorId) {
      return res
        .status(400)
        .json({ status: false, error: "vendorId is required" });
    }

    // Validate keys
    if (!Array.isArray(keys) || keys.length === 0) {
      return res
        .status(400)
        .json({
          status: false,
          error: "keys array is required and cannot be empty",
        });
    }

    // Validate each key
    for (let key of keys) {
      if (!key.keyName) {
        return res
          .status(400)
          .json({ status: false, error: "Each key must have a keyName" });
      }
      if (key.value === undefined) {
        return res
          .status(400)
          .json({ status: false, error: "Each key must have a value" });
      }
    }

    const bankDetails = await VendorBankModel.findOne({ vendor_Id: vendorId }) //.select("_id vendor_Id  ");
    if (!bankDetails) {
      return res.status(404).json({ status: false, error: "No records found" });
    }
    // console.log(bankDetails)

    // Update keys and check for non-existing keys
    let allKeysExist = true;
    for (const newKey of keys) {
      const existingKey = bankDetails.keys.find(
        (key) => key.keyName === newKey.keyName
      );
      if (existingKey) {
        if (newKey.value) {
          /* ------------------- ENCRYPT THE VALUE AND SAVED INTO DB ------------------ */
          const ciphertext = CryptoJS.AES.encrypt(
            newKey.value,
            process.env.SECRET_KEY
          ).toString();
          // console.log(ciphertext);
          // console.log(`Encrypting value for key: ${newKey.keyName}`);
          existingKey.value = ciphertext;
          // console.log(`Encrypted value: ${existingKey.value}`);
        }
      } else {
        allKeysExist = false;
      }
    }

    if (!allKeysExist) {
      return res
        .status(400)
        .json({ status: false, error: "One or more keys do not exist" });
    }

    await bankDetails.save();
    res
      .status(200)
      .json({
        status: true,
        message: "Values Inserted Successfully",
        data: bankDetails,
      });
  } catch (error) {
    res.status(500).json({ status:false,error: error.message });
  }
};

/* ------------------- HERE WE ARE DELETE THE VENDOR BANKS ------------------ */

export const deleteVendorBank = async (req, res) => {
  try {
    const { vendor_Id } = req.params;

    // Check if the vendor bank exists
    const vendorBank = await VendorBankModel.findOne({ vendor_Id });

    if (!vendorBank) {
      return res.status(404).json({ status: false, error: "Vendor Bank not found" });
    }

    // Delete the vendor bank
    await VendorBankModel.deleteOne({ vendor_Id });

    res.status(200).json({
      status: true,
      message: "Vendor Bank deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};


