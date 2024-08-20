import User from "../models/user.js";
import userDocModel from "../models/userDocDetails/userDocDetails.js";
import TokenModel from "../models/tokenSchema.js";
import CryptoJS from "crypto-js";
import { createJwt } from "../utils/jwt_token.js";
import sendEmail from "../utils/email/sendEmail.js";
import AppModel from "../models/appModel.js";

// FUNCTION FOR GENERATE MERCHANTID
function generateMerchantId() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const minLength = 18;
  const maxLength = 24;
  const length =
    Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  let merchantId = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    merchantId += characters.charAt(randomIndex);
  }

  return merchantId;
}

export const createMerchant = async (req, res) => {
  try {
    const {
      name,
      password,
      email,
      phonenumber,
      confirmpassword,
      accountHolderName,
      accountType,
      accountNumber,
      confirmAn,
      ifscCode,
      branchName,
      companyName,
      businessType,
      businessCategory,
      description,
      website,
      city,
      state,
      address,
      pincode,
      agree,
      panNumber,
      aadharVoterIdPassportDLNumber,
      gstNumber,
      cancelledCheque,
      companyPan,
      registrationCertificate,
    } = req.body;

    if (
      !name ||
      !password ||
      !email ||
      !phonenumber ||
      !confirmpassword ||
      !accountHolderName ||
      !accountType ||
      !accountNumber ||
      !confirmAn ||
      !ifscCode ||
      !branchName ||
      !companyName ||
      !businessType ||
      !businessCategory ||
      !description ||
      !website ||
      !city ||
      !state ||
      !address ||
      !pincode ||
      !agree ||
      !panNumber ||
      !aadharVoterIdPassportDLNumber ||
      !gstNumber ||
      !cancelledCheque ||
      !companyPan ||
      !registrationCertificate
    ) {
      return res
        .status(400)
        .json({ status: false, error: "All fields are mandatory" });
    }

    const {
      panAttachment,
      cancelledChequeAttachment,
      aadharVoterIdPassportAttachment,
    } = req.files;

    if (
      !panAttachment[0] ||
      !cancelledChequeAttachment[0] ||
      !aadharVoterIdPassportAttachment[0]
    ) {
      return res
        .status(400)
        .json({ status: false, error: "All Documents are mandatory" });
    }

    const emailExist = await User.findOne({ email });
    if (emailExist) {
      return res
        .status(409)
        .json({ status: false, error: "Email already exists" });
    }

    const phoneNumberExist = await User.findOne({ phonenumber });
    if (phoneNumberExist) {
      return res
        .status(409)
        .json({ status: false, error: "Phone number already exists" });
    }

    // Encrypt the password using AES encryption
    const ciphertext = CryptoJS.AES.encrypt(
      password,
      process.env.REFRESH_TOKEN_SECRET
    ).toString();

    // Create user with encrypted password
    const userData = await User.create({
      name,
      phonenumber,
      password: ciphertext,
      email: String(email).toLowerCase(),
      prevPassword: ciphertext,
      is_merchant: true,
      m_id: generateMerchantId(),
      is_active: true,
    });

    const merchantId = userData.m_id;

    const UserDocData = {
      m_id: merchantId,
      companyName,
      businessType,
      businessCategory,
      description,
      website,
      city,
      state,
      address,
      pincode,
      accountHolderName,
      accountType,
      accountNumber,
      confirmAn,
      ifscCode,
      branchName,
      panNumber,
      aadharVoterIdPassportDLNumber,
      gstNumber,
      cancelledCheque,
      companyPan,
      registrationCertificate,
      cancelledChequeAttachment: cancelledChequeAttachment[0]?.filename,
      aadharVoterIdPassportAttachment:
        aadharVoterIdPassportAttachment[0]?.filename,
      panAttachment: panAttachment[0]?.filename,
    };

    const userDocDetails = await userDocModel.updateOne(
      { m_id: merchantId },
      UserDocData,
      { upsert: true }
    );
    console.log(userDocDetails);

    if (userDocDetails.acknowledged) {
      await User.updateOne(
        { m_id: merchantId },
        { isBasic: true, documents_upload: true }
      );
    }

    try {
      // Generate JWT token
      const generateToken = await createJwt(email, userData._id);

      // Save token to database
      const tokenData = new TokenModel({
        userId: userData._id,
        token: generateToken,
      });
      await tokenData.save();

      // Construct email verification link

      const welcomeLink = `${process.env.FRONTEND_URL}/axonaio/user/email-verification?token=${generateToken}`;
      // console.log(welcomeLink)
      // Send verification email
      await sendEmail(
        email,
        "Verify your email",
        { name: userData.name, link: welcomeLink },
        "./template/welcome.handlebars"
      );
      console.log(sendEmail);
      // Prepare user data for response
      const user = await User.findOne({ m_id: merchantId }).select(
        "-password -prevPassword -prevPrevPassword"
      );

      return res.status(201).json({
        message: "Merchant created successfully",
        data: user,
        status: true,
      });
    } catch (error) {
      return res
        .status(401)
        .json({ status: false, error: "Error in sending mail" });
    }
  } catch (error) {
    return res.status(500).json({ status: false, error: error.message });
  }
};

export const getAllMerchant = async (req, res) => {
  try {
    const merchantsData = await User.find({
      is_merchant: true,
      is_active: true,
    }).select("-_id -password -prevPassword -prevPrevPassword");
    if (merchantsData.length == 0) {
      return res.status(404).json({ status: false, error: "no records found" });
    }
    return res.status(200).json({
      status: true,
      message: "Fetched successfully",
      data: merchantsData,
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

export const toggleMerchant = async (req, res) => {
  try {
    const merchantId = req.params.id;

    const merchant = await User.findOne({ m_id: merchantId });

    if (!merchant) {
      return res.status(404).json({
        status: false,
        error: "No records found",
      });
    }

    const newStatus = !merchant.is_active;
    await User.updateOne(
      { m_id: merchantId },
      { $set: { is_active: newStatus } }
    );

    return res.status(200).json({
      status: true,
      message: `Merchant ${
        newStatus ? "activated" : "deactivated"
      } successfully`,
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};
/* -------------------- LIVE MODE ACCESS TO THE MERCHANT -------------------- */
export const toggleLiveModeAccess = async (req, res) => {
  try {
    const { id: merchantId } = req.params;

    if (!merchantId) {
      return res
        .status(400)
        .json({ status: false, error: "merchantId is required" });
    }

    // Find the merchant by ID
    const merchant = await User.findOne({ m_id: merchantId });

    if (!merchant) {
      return res.status(404).json({
        status: false,
        error: "No records found",
      });
    }

    // Toggle the change_app_mode field
    merchant.change_app_mode = !merchant.change_app_mode;
    await merchant.save();

    const statusMessage = merchant.change_app_mode
      ? `${merchant.name} is now allowed to switch to live mode.`
      : `${merchant.name} has been restricted from switching to live mode.`;

    return res.status(200).json({
      status: true,
      message: statusMessage,
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

/* ------------------- ENABLE PERMISSIONS TO THE MERCHANT ------------------- */
// export const updateMerchantPermissions = async (req, res) => {
//   try {

//     const {  app_permissions, action } = req.body;
//     const merchantId = req.params.merchantId

//     if (!merchantId || !Array.isArray(app_permissions) || !['add', 'remove'].includes(action)) {
//         return res.status(400).json({
//             status: false,
//             error: "Invalid request data",
//         });
//     }
//       const update = action === 'add' ? { $addToSet: { app_permissions: { $each: app_permissions } } } : { $pull: { app_permissions: { $in: app_permissions } } };
//       const updatedMerchant = await User.findOneAndUpdate({ m_id: merchantId }, update, { new: true });

//       if (!updatedMerchant) {
//           return res.status(404).json({
//               status: false,
//               error: "merchant not found",
//           });
//       }

//       return res.status(200).json({
//           status: true,
//           message: `Permissions has been successfully ${action === 'add' ? 'added to' : 'removed from'} ${updatedMerchant.role} ${updatedMerchant.first_name} ${updatedMerchant.last_name} `,
//           data: updatedMerchant.app_permissions,
//       });
//   } catch (error) {
//       return res.status(500).json({
//           status: false,
//           error: error.message,
//       });
//   }
// };

/* ------------------- ENABLE APP PERMISSIONS FOR MERCHANT ------------------ */
/* ------------------------------ Updated code ------------------------------ */

export const appPermissionsForMerchant = async (req, res) => {
  try {
    const { merchantId } = req.params;
    const { appId } = req.body;

    // Validate input
    if (!merchantId || !appId) {
      return res
        .status(400)
        .json({ status: false, error: "Please fill all the details" });
    }

    // Find the user by merchantId
    const user = await User.findOne({ m_id: merchantId });

    if (!user) {
      return res
        .status(404)
        .json({ status: false, error: "Merchant not found" });
    }

    // Find the app by appId
    const getAppName = await AppModel.findOne({ app_id: appId });

    if (!getAppName) {
      return res.status(404).json({ status: false, error: "App not found" });
    }

    const appName = getAppName.app_name;
    const appIndex = user.app_permissions.indexOf(appName);

    let message;

    if (appIndex > -1) {
      // If the appName already exists in app_permissions, remove it
      user.app_permissions.splice(appIndex, 1);
      message = `${appName} has been successfully removed from the merchant's permissions.`;
    } else {
      // If the appName does not exist, add it to app_permissions
      user.app_permissions.push(appName);
      message = `${appName} has been successfully added to the merchant's permissions.`;
    }

    await user.save();

    return res.status(200).json({
      status: true,
      message: message,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message,
    });
  }
};
