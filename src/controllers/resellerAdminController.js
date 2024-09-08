import User from "../models/user.js";

// FUNCTION FOR GENERATE RESELLERID
function generateAdminResellerId() {
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
export const fetchFreshReseller = async (req, res) => {
  try {
    // Step 1: Fetch all resellers
    const allResellers = await User.find({
      // is_merchant: true,
      is_reseller: true,
      is_reseller_admin: false,
    }).select("_id m_id r_id ra_id name email phonenumber");

    // Step 2: Fetch all users who have resellers under them
    const usersWithResellers = await User.find({
      $or: [
        { resellers_merchant: { $exists: true, $ne: [] } },
        { my_resellers: { $exists: true, $ne: [] } },
        { reseller_admins_merchant: { $exists: true, $ne: [] } },
      ],
    }).select("resellers_merchant my_resellers reseller_admins_merchant");

    // Step 3: Gather all merchant IDs present in any of the arrays
    let associatedMerchantIds = new Set();

    usersWithResellers.forEach((user) => {
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

    // Step 4: Filter out resellers whose IDs are present in any of the arrays
    const freshResellers = allResellers.filter(
      (merchant) => !associatedMerchantIds.has(merchant._id.toString())
    );

    // Step 5: Respond with the fresh resellers
    if (freshResellers.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "No fresh resellers found" });
    }

    res.status(200).json({ status: true, data: freshResellers });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

/* ------------------------------ MAKE RESELLER ----------------------------- */

export const make_reseller_admin = async (req, res) => {
  try {
    const resellerId = req.params.resellerId;
    if (!resellerId) {
      return res
        .status(400)
        .json({ status: false, error: "resellerId missing" });
    }

    // Find the merchant by their m_id
    const findReseller = await User.findOne({ r_id: resellerId });

    if (!findReseller) {
      return res
        .status(404)
        .json({ status: false, error: "Reseller not found" });
    }

    // Set the reseller ID and update the is_reseller field
    findReseller.ra_id = generateAdminResellerId();
    findReseller.is_reseller_admin = true;

    // Save the changes
    await findReseller.save();

    res.status(200).json({
      status: true,
      message: "Reseller became  Reseller-Admin successfully",
      data: findReseller,
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

/* ---------------------------- FETCH ADMIN-RESELLER's ---------------------------- */
export const fetchAdminReseller = async (req, res) => {
  try {
    // Fetch resellers with a valid ra_id and is_reseller set to true
    const adminResellerData = await User.find({
      is_reseller_admin: true,
      ra_id: { $exists: true, $ne: null },
    }); //.select("_id m_id r_id ra_id name email phonenumber");
    if (adminResellerData.length == 0) {
      return res.status(404).json({ status: false, error: "No Records Found" });
    }

    return res.status(200).json({
      status: true,
      message: "AdminReseller's data fetched successfully",
      data: adminResellerData,
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

/* ---------------------- FETCH THE ADMIN RESELLER'S MERCHANT --------------------- */
export const populateResellerAdmins_Reseller = async (req, res) => {
  try {
    const resellerAdminId = req.params.resellerAdminId;

    if (!resellerAdminId) {
      return res
        .status(400)
        .json({ status: false, error: "resellerAdminId missing" });
    }

    // Find the reseller and populate the resellers_merchant array
    const adminReseller = await User.findOne({
      ra_id: resellerAdminId,
      is_reseller_admin: true,
    })
      .select("-password -prevPassword -prevPrevPassword")
      .populate({
        path: "my_resellers",
        select: "-password -prevPassword -prevPrevPassword", // Exclude sensitive fields
      });

    // Check if the reseller or the resellers_merchant array is empty
    if (!adminReseller || adminReseller.my_resellers.length === 0) {
      return res.status(404).json({
        status: false,
        error: "No resellers found for this reseller-admin.",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Fetched successfully",
      data: adminReseller.my_resellers,
    });
  } catch (error) {
    return res.status(500).json({ status: false, error: error.message });
  }
};

/* ---------------------- FETCH THE ADMIN RESELLER'S MERCHANT --------------------- */
export const populateResellerAdminsMerchant = async (req, res) => {
  try {
    const resellerAdminId = req.params.resellerAdminId;

    if (!resellerAdminId) {
      return res
        .status(400)
        .json({ status: false, error: "resellerAdminId missing" });
    }

    // Find the reseller and populate the resellers_merchant array
    const adminReseller = await User.findOne({
      ra_id: resellerAdminId,
      is_reseller_admin: true,
    })
      .select("-password -prevPassword -prevPrevPassword")
      .populate({
        path: "reseller_admins_merchant",
        select: "-password -prevPassword -prevPrevPassword", // Exclude sensitive fields
      });

    // Check if the reseller or the resellers_merchant array is empty
    if (!adminReseller || adminReseller.reseller_admins_merchant.length === 0) {
      return res.status(404).json({
        status: false,
        error: "No merchants found for this reseller admin.",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Fetched successfully",
      data: adminReseller.reseller_admins_merchant,
    });
  } catch (error) {
    return res.status(500).json({ status: false, error: error.message });
  }
};

/* ---- REMOVE THE MERCHANT-OBJECTID FROM ARRAY AND MAKE HIM INDEPENDENT ---- */
/* --------- ADD MERCHANT UNDER THE RESELLER AND MAKE HIM DEPENDENT --------- */
/* -------- IN THIS API WE CAN ADD/REMOVE THE MERCHANT FROM THE ARRAY ------- */

export const manageMerchantIn_RA_Array = async (req, res) => {
  try {
    const resellerAdminId = req.params.resellerAdminId;
    const merchantId = req.params.merchantId;
    const action = req.query.action; // 'add' or 'remove'

    if (!merchantId) {
      return res
        .status(400)
        .json({ status: false, error: "merchantId missing" });
    }

    if (!resellerAdminId) {
      return res
        .status(400)
        .json({ status: false, error: "resellerAdminId missing" });
    }

    if (!action) {
      return res.status(400).json({
        status: false,
        error: "Action parameter missing. Use 'add' or 'remove'.",
      });
    }

    // Find the resellerAdmin first
    const resellerAdmin = await User.findOne({ ra_id: resellerAdminId });

    if (!resellerAdmin) {
      return res
        .status(404)
        .json({ status: false, message: "Reseller Admin not found." });
    }
    // check the existence of merchantId
    const checkExistence = await User.findById(merchantId);
    if (!checkExistence) {
      return res.status(400).json({ status: false, error: "Invalid Id" });
    }

    if (action === "add") {
      // Check if the merchant is already in the array
      if (resellerAdmin.reseller_admins_merchant.includes(merchantId)) {
        return res.status(400).json({
          status: false,
          message: "Merchant is already added to resellerAdmin's array.",
        });
      }

      // Add the merchant to the array
      resellerAdmin.reseller_admins_merchant.push(merchantId);
    } else if (action === "remove") {
      // Check if the merchant is in the array
      if (!resellerAdmin.reseller_admins_merchant.includes(merchantId)) {
        return res.status(400).json({
          status: false,
          message: "Merchant not found in resellerAdmin's array.",
        });
      }

      // Remove the merchant from the array
      resellerAdmin.reseller_admins_merchant.pull(merchantId);
    } else {
      return res.status(400).json({
        status: false,
        error: "Invalid action. Use 'add' or 'remove'.",
      });
    }

    // Save the changes
    await resellerAdmin.save();

    return res.status(200).json({
      status: true,
      message:
        action === "add"
          ? "Merchant added to resellerAdmin's array successfully"
          : "Merchant removed from resellerAdmin's array successfully",
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

/* -------- IN THIS API WE CAN ADD/REMOVE THE RESELLER FROM THE ARRAY ------- */

export const manageResellerInArray = async (req, res) => {
  try {
    const resellerAdminId = req.params.resellerAdminId;
    const resellerId = req.params.resellerId;
    const action = req.query.action; // 'add' or 'remove'

    if (!resellerId) {
      return res
        .status(400)
        .json({ status: false, error: "resellerId missing" });
    }

    if (!resellerAdminId) {
      return res
        .status(400)
        .json({ status: false, error: "resellerAdminId missing" });
    }

    if (!action) {
      return res.status(400).json({
        status: false,
        error: "Action parameter missing. Use 'add' or 'remove'.",
      });
    }

    // Find the resellerAdmin first
    const resellerAdmin = await User.findOne({ ra_id: resellerAdminId });

    if (!resellerAdmin) {
      return res
        .status(404)
        .json({ status: false, message: "Reseller Admin not found." });
    }

    // check the existence of merchantId
    const checkExistence = await User.findById(resellerId);
    if (!checkExistence) {
      return res.status(400).json({ status: false, error: "Invalid Id" });
    }

    if (action === "add") {
      // Check if the merchant is already in the array
      if (resellerAdmin.my_resellers.includes(resellerId)) {
        return res.status(400).json({
          status: false,
          message: "Reseller is already added to resellerAdmin's array.",
        });
      }

      // Add the merchant to the array
      resellerAdmin.my_resellers.push(resellerId);
    } else if (action === "remove") {
      // Check if the merchant is in the array
      if (!resellerAdmin.my_resellers.includes(resellerId)) {
        return res.status(400).json({
          status: false,
          message: "Reseller not found in resellerAdmin's array.",
        });
      }

      // Remove the merchant from the array
      resellerAdmin.my_resellers.pull(resellerId);
    } else {
      return res.status(400).json({
        status: false,
        error: "Invalid action. Use 'add' or 'remove'.",
      });
    }

    // Save the changes
    await resellerAdmin.save();

    return res.status(200).json({
      status: true,
      message:
        action === "add"
          ? "Reseller added to resellerAdmin's array successfully"
          : "Reseller removed from resellerAdmin's array successfully",
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};
