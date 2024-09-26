import CryptoJS from "crypto-js";
import User from "../models/user.js";
import Token from "../models/tokenSchema.js";
import { testPayinApiKey, livePayinApiKey } from "../models/payin/apikeys.js";
import {
  testPayoutApiKey,
  livePayoutApiKey,
} from "../models/payout/apiKeys.js";
import { testPayinWebhook, livePayinWebhook } from "../models/payin/webhook.js";
import {
  testPayoutWebhook,
  livePayoutWebhook,
} from "../models/payout/webhook.js";
// const secret_key = process.env.REFRESH_TOKEN_SECRET
const secret_key = "sasdamkjbfkakjkjakajkjabkabfkahbf";

export const updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const merchantId = req.params.merchantId;
    console.log(req.body);
    if (!newPassword) {
      return res
        .status(400)
        .json({ status: false, error: "New password is required." });
    }

    const user = await User.findOne({ m_id: merchantId });
    if (!user) {
      return res.status(404).json({ status: false, error: "User not found." });
    }

    // Decrypt stored previous passwords
    const decryptedPrevPassword = user.prevPassword
      ? CryptoJS.AES.decrypt(user.prevPassword, secret_key).toString(
          CryptoJS.enc.Utf8
        )
      : null;

    const decryptedPrevPrevPassword = user.prevPrevPassword
      ? CryptoJS.AES.decrypt(user.prevPrevPassword, secret_key).toString(
          CryptoJS.enc.Utf8
        )
      : null;

    // Ensure the new password is not the same as any of the previous passwords
    if (
      user.password === newPassword ||
      decryptedPrevPassword === newPassword ||
      decryptedPrevPrevPassword === newPassword
    ) {
      return res.status(422).json({
        status: false,
        error: "The new password cannot be the same as any previous passwords.",
      });
    }

    // Encrypt the new password
    const encryptedNewPassword = CryptoJS.AES.encrypt(
      newPassword,
      secret_key
    ).toString();

    // Update the user's password history
    user.prevPrevPassword = user.prevPassword || "";
    user.prevPassword = user.password;
    user.password = encryptedNewPassword;

    await user.save();

    // Invalidate all existing tokens
    // await Token.deleteMany();

    res
      .status(200)
      .json({ status: true, message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

/* ------------------------------ FETCH APIKEYs ----------------------------- */

// Utility function to get the correct model based on the type (payin/payout) and mode (test/live)
const getApiKeyModel = (type, mode) => {
  if (type === "payin") {
    return mode === "live" ? livePayinApiKey : testPayinApiKey;
  } else if (type === "payout") {
    return mode === "live" ? livePayoutApiKey : testPayoutApiKey;
  }
  throw new Error("Invalid type provided");
};

// Combined API for both Payin and Payout API keys
export const getApiKey = async (req, res) => {
  try {
    const merchantId = req.params.merchantId;
    const { mode, type } = req.query;

    // Validate mode
    if (!mode || (mode !== "test" && mode !== "live")) {
      return res.status(400).json({
        status: false,
        error: "Please select a valid Mode ('test' or 'live')",
      });
    }

    // Validate type
    if (!type || (type !== "payin" && type !== "payout")) {
      return res.status(400).json({
        status: false,
        error: "Please select a valid Type ('payin' or 'payout')",
      });
    }

    // Get the correct model based on type and mode
    const ApiKeyModel = getApiKeyModel(type, mode);

    // Fetch API key data
    const apiKeyData = await ApiKeyModel.find({ m_id: merchantId });

    if (!apiKeyData.length) {
      return res.status(404).json({
        status: false,
        error: "No records found",
      });
    }

    // Return the fetched data
    return res.status(200).json({
      status: true,
      data: apiKeyData,
      message: "Fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message,
    });
  }
};

/* --------------------------- FETCH WEBHOOK APIs --------------------------- */

// Utility function to get the correct model based on the type (payin/payout) and mode (test/live)
const getWebhookModel = (type, mode) => {
  if (type === "payin") {
    return mode === "live" ? livePayinWebhook : testPayinWebhook;
  } else if (type === "payout") {
    return mode === "live" ? livePayoutWebhook : testPayoutWebhook;
  }
  throw new Error("Invalid type provided");
};

// Combined API for both Payin and Payout Webhooks
export const getWebhook = async (req, res) => {
  try {
    const merchantId = req.params.merchantId;
    const { mode, type } = req.query;

    // Validate mode
    if (!mode || (mode !== "test" && mode !== "live")) {
      return res.status(400).json({
        status: false,
        error: "Please select a valid Mode ('test' or 'live')",
      });
    }

    // Validate type
    if (!type || (type !== "payin" && type !== "payout")) {
      return res.status(400).json({
        status: false,
        error: "Please select a valid Type ('payin' or 'payout')",
      });
    }

    // Get the correct model based on type and mode
    const WebhookModel = getWebhookModel(type, mode);

    // Fetch webhook data
    const webhookData = await WebhookModel.find({ m_id: merchantId });

    if (!webhookData.length) {
      return res.status(404).json({
        status: false,
        error: "No records found",
      });
    }

    // Return the fetched data
    return res.status(200).json({
      status: true,
      data: webhookData,
      message: "Fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message,
    });
  }
};
