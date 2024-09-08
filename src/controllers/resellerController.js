import User from "../models/user.js";

// FUNCTION FOR GENERATE RESELLERID
function generateResellerId() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const minLength = 18;
  const maxLength = 24;
  const length =
    Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  let resellerId = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    resellerId += characters.charAt(randomIndex);
  }

  return resellerId;
}

/* -------------------------- FETCH FRESH MERCHANTS ------------------------- */
export const fetchFreshMerchant = async (req, res) => {
  try {
    // Step 1: Fetch all merchants
    const allMerchants = await User.find({
      is_merchant: true,
      is_reseller: false,
      is_reseller_admin: false,
    }).select("_id m_id r_id ra_id name email phonenumber");

    // Step 2: Fetch all users who have merchants under them
    const usersWithMerchants = await User.find({
      $or: [
        { resellers_merchant: { $exists: true, $ne: [] } },
        { my_resellers: { $exists: true, $ne: [] } },
        { reseller_admins_merchant: { $exists: true, $ne: [] } },
      ],
    }).select("resellers_merchant my_resellers reseller_admins_merchant");

    // Step 3: Gather all merchant IDs present in any of the arrays
    let associatedMerchantIds = new Set();

    usersWithMerchants.forEach((user) => {
      user.resellers_merchant.forEach((id) =>
        associatedMerchantIds.add(id.toString())
      );
      user.my_resellers.forEach((id) =>
        associatedMerchantIds.add(id.toString())
      );
      user.reseller_admins_merchant.forEach((id) =>
        associatedMerchantIds.add(id.toString())
      );
    });

    // Step 4: Filter out merchants whose IDs are present in any of the arrays
    const freshMerchants = allMerchants.filter(
      (merchant) => !associatedMerchantIds.has(merchant._id.toString())
    );

    // Step 5: Respond with the fresh merchants
    if (freshMerchants.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "No fresh merchants found" });
    }

    res.status(200).json({ status: true, data: freshMerchants });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

/* ------------------------------ MAKE RESELLER ----------------------------- */

export const make_reseller = async (req, res) => {
  try {
    const merchantId = req.params.merchantId;
    if (!merchantId) {
      return res
        .status(400)
        .json({ status: false, error: "merchantId missing" });
    }

    // Find the merchant by their m_id
    const findMerchant = await User.findOne({ m_id: merchantId });

    if (!findMerchant) {
      return res
        .status(404)
        .json({ status: false, error: "Merchant not found" });
    }

    // Set the reseller ID and update the is_reseller field
    findMerchant.r_id = generateResellerId();
    findMerchant.is_reseller = true;

    // Save the changes
    await findMerchant.save();

    res.status(200).json({
      status: true,
      message: "Merchant updated to reseller successfully",
      data: findMerchant,
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

/* ---------------------------- FETCH RESELLER's ---------------------------- */
export const fetchReseller = async (req, res) => {
  try {
    // Fetch resellers with a valid r_id and is_reseller set to true
    const resellerData = await User.find({
      is_reseller: true,
      is_reseller_admin: false,
      r_id: { $exists: true, $ne: null },
    }); //.select("_id m_id r_id ra_id name email phonenumber");
    if (resellerData.length == 0) {
      return res.status(404).json({ status: false, error: "No Records Found" });
    }

    return res.status(200).json({
      status: true,
      message: "Reseller's data fetched successfully",
      data: resellerData,
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

/* ---------------------- FETCH THE RESELLER'S MERCHANT --------------------- */
export const populateResellersMerchant = async (req, res) => {
  try {
    const resellerId = req.params.resellerId;

    if (!resellerId) {
      return res
        .status(400)
        .json({ status: false, error: "resellerId missing" });
    }

    // Find the reseller and populate the resellers_merchant array
    const reseller = await User.findOne({
      r_id: resellerId,
      is_reseller: true,
    })
      .select("-password -prevPassword -prevPrevPassword")
      .populate({
        path: "resellers_merchant",
        select: "-password -prevPassword -prevPrevPassword", // Exclude sensitive fields
      });

    // Check if the reseller or the resellers_merchant array is empty
    if (!reseller || reseller.resellers_merchant.length === 0) {
      return res.status(404).json({
        status: false,
        error: "No merchants found for this reseller.",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Fetched successfully",
      data: reseller.resellers_merchant,
    });
  } catch (error) {
    return res.status(500).json({ status: false, error: error.message });
  }
};

/* ---- REMOVE THE MERCHANT-OBJECTID FROM ARRAY AND MAKE HIM INDEPENDENT ---- */
/* --------- ADD MERCHANT UNDER THE RESELLER AND MAKE HIM DEPENDENT --------- */

/* -------- IN THIS API WE CAN ADD/REMOVE THE MERCHANT FROM THE ARRAY ------- */

export const manageMerchantInArray = async (req, res) => {
  try {
    const resellerId = req.query.resellerId;
    const merchantId = req.query.merchantId;

    const action = req.query.action; // 'add' or 'remove'

    if (!merchantId) {
      return res
        .status(400)
        .json({ status: false, error: "merchantId missing" });
    }

    if (!resellerId) {
      return res
        .status(400)
        .json({ status: false, error: "resellerId missing" });
    }

    if (!action) {
      return res.status(400).json({
        status: false,
        error: "Action parameter missing. Use 'add' or 'remove'.",
      });
    }

    // Find the reseller first
    const reseller = await User.findOne({ r_id: resellerId });

    if (!reseller) {
      return res
        .status(404)
        .json({ status: false, message: "Reseller not found." });
    }

    if (action === "add") {
      // Check if the merchant is already in the array
      if (reseller.resellers_merchant.includes(merchantId)) {
        return res.status(400).json({
          status: false,
          message: "Merchant is already added to reseller's array.",
        });
      }

      // Add the merchant to the array
      reseller.resellers_merchant.push(merchantId);
    } else if (action === "remove") {
      // Check if the merchant is in the array
      if (!reseller.resellers_merchant.includes(merchantId)) {
        return res.status(400).json({
          status: false,
          message: "Merchant not found in reseller's array.",
        });
      }

      // Remove the merchant from the array
      reseller.resellers_merchant.pull(merchantId);
    } else {
      return res.status(400).json({
        status: false,
        error: "Invalid action. Use 'add' or 'remove'.",
      });
    }

    // Save the changes
    await reseller.save();

    return res.status(200).json({
      status: true,
      message:
        action === "add"
          ? "Merchant added to reseller's array successfully"
          : "Merchant removed from reseller's array successfully",
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};
