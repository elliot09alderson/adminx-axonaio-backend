import { Router } from "express";
import {
  getUserChannelProfile,
  logOutUser,
  refreshAccessToken,
  registerUser,
  userLogin,
  verifyEmail,
  whitelistMiddleware,
} from "../controllers/adminController.js";
import { isSuperAdmin, verifyJWT } from "../middlewares/authmidlleware.js";
import {
  appPermissionsForMerchant,
  createMerchant,
  getAllMerchant,
  toggleLiveModeAccess,
  toggleMerchant,
} from "../controllers/adminMerchantController.js";
import {
  getPayinPricing,
  getPayoutPricing,
  set_payin_pricing,
  set_payout_pricing,
} from "../controllers/merchantPricingController.js";
import {
  getPayinTransactionByDate,
  getTodaysPayinTransaction,
} from "../controllers/merchantTransactionController.js";
export const adminRouter = Router();

import { pdfUpload, avatarUpload } from "../utils/fileUploadUtil.js";
import multer from "multer";
import {
  createVendorBank,
  deleteVendorBank,
  getAllVendorBanksByFilter,
  getKeysCount,
  insertValues,
} from "../controllers/vendorBankController.js";
import {
  createRouting,
  fetchRoutingData,
} from "../controllers/routingManagementController.js";
import { dashBoardApis } from "../controllers/dashboardApi.js";
import {
  calculateSettlement,
  createSettlement,
  fetchSettlementByFilter,
} from "../controllers/settlementController.js";
import {
  fetchEmployees,
  getEmployeeProfile,
  toggleEmployee,
  togglePermissions,
  updateEmployeeDetails,
} from "../controllers/employeeController.js";
import {
  create_app,
  fetch_active_app,
  fetch_app,
  toggle_status,
} from "../controllers/appController.js";

import {
  fetchUserDocDetails,
  merchantDocUpload,
  updateUserDetails,
  updateUserReasonsAndNotify,
} from "../controllers/riskAndComplianceController.js";
import { fetchUserDetailsById } from "../controllers/riskAndComplianceController.js";
import {
  fetchFreshMerchant,
  fetchReseller,
  make_reseller,
  manageMerchantInArray,
  populateResellersMerchant,
} from "../controllers/resellerController.js";
import {
  fetchAdminReseller,
  fetchFreshReseller,
  make_reseller_admin,
  manageMerchantIn_RA_Array,
  manageResellerInArray,
  populateResellerAdmins_Reseller,
  populateResellerAdminsMerchant,
} from "../controllers/resellerAdminController.js";
import {
  getApiKey,
  getWebhook,
  updatePassword,
} from "../controllers/settingsController.js";
import {
  createApiWhiteList,
  createDomainWhitelist,
  deleteApiWhiteListIp,
  deleteWhiteListDomain,
  getApiWhitelistIp,
  getDomainWhitelist,
} from "../controllers/adminSettingsController.js";

let uploadDoc = multer({ storage: pdfUpload("/uploads") });
let uploadAvatar = multer({ storage: avatarUpload("/images") });

adminRouter
  .route("/register")
  .post(
    verifyJWT,
    uploadAvatar.fields([{ name: "avatar", maxCount: 1 }]),
    registerUser
  );

adminRouter.route("/login").post(userLogin);
adminRouter.route("/verify_email").post(verifyEmail);

/* ------------------------------ secure routes ----------------------------- */
adminRouter.route("/refresh-token").post(refreshAccessToken);

adminRouter.route("/logout").put(verifyJWT, logOutUser);
adminRouter.route("/profile/:username").post(verifyJWT, getUserChannelProfile);

/* -------------------------------------------------------------------------- */
/*                             MERCHANT OPERATION                             */
/* -------------------------------------------------------------------------- */

adminRouter.route("/fetch_merchant").get(verifyJWT, getAllMerchant);
adminRouter.route("/onboard_merchant").post(
  verifyJWT,
  uploadDoc.fields([
    { name: "panAttachment", maxCount: 1 },
    { name: "cancelledChequeAttachment", maxCount: 1 },
    { name: "aadharVoterIdPassportAttachment", maxCount: 1 },
  ]),
  createMerchant
);
adminRouter.route("/merchant/toggle/:id").put(verifyJWT, toggleMerchant);
adminRouter
  .route("/merchant/mode_access/:id")
  .put(verifyJWT, toggleLiveModeAccess);
adminRouter
  .route("/merchant/app_permissions/:merchantId")
  .put(verifyJWT, appPermissionsForMerchant);

/* ---------------------------------- PAYIN --------------------------------- */

adminRouter
  .route("/set_payin_price/:merchantId")
  .put(verifyJWT, set_payin_pricing);
adminRouter
  .route("/get_payin_price/:merchantId")
  .get(verifyJWT, getPayinPricing);
adminRouter
  .route("/get_payin_transaction/:merchantId")
  .get(verifyJWT, getTodaysPayinTransaction);
adminRouter
  .route("/get_payin_transaction_by_date/:merchantId")
  .get(verifyJWT, getPayinTransactionByDate);

/* --------------------------------- PAYOUT --------------------------------- */

adminRouter
  .route("/set_payout_price/:merchantId")
  .put(verifyJWT, set_payout_pricing);
adminRouter
  .route("/get_payout_price/:merchantId")
  .get(verifyJWT, getPayoutPricing);

/* ---------------------------- VENDOR BANKS APIS --------------------------- */

adminRouter.route("/create_vendor_banks").post(verifyJWT, createVendorBank);
adminRouter
  .route("/fetch_vendor_banks")
  .get(verifyJWT, getAllVendorBanksByFilter);
adminRouter.route("/fetch_banks_keys/:vendorId").get(verifyJWT, getKeysCount);
adminRouter
  .route("/insert_values/:vendorId/values")
  .put(verifyJWT, insertValues);
adminRouter
  .route("/delete_vendor_banks/:vendorId")
  .delete(verifyJWT, deleteVendorBank);

/* ------------------------------ ROUTING APIS ------------------------------ */
adminRouter.route("/create_route").post(verifyJWT, createRouting);
adminRouter.route("/fetch_routes/:merchantId").get(verifyJWT, fetchRoutingData);

/* ----------------------------- DASHBOARD APIS ----------------------------- */
adminRouter.route("/dashboard_data").get(verifyJWT, dashBoardApis);

/* ------------------------------ DO SETTLEMENT ----------------------------- */

adminRouter.route("/do_settlement").post(verifyJWT, createSettlement);
adminRouter.route("/fetch_settlement").get(verifyJWT, fetchSettlementByFilter);
adminRouter.route("/calculate_settlement").get(verifyJWT, calculateSettlement);

/* -------------------------- MANAGE EMPLOYEE APIs -------------------------- */

adminRouter
  .route("/employee/toggle/:id")
  .put(verifyJWT, isSuperAdmin, toggleEmployee);
adminRouter.route("/fetch_employees").get(verifyJWT, fetchEmployees);
adminRouter
  .route("/employee_permissions")
  .put(verifyJWT, isSuperAdmin, togglePermissions);
adminRouter
  .route("/employees/update/:id")
  .put(verifyJWT, updateEmployeeDetails);
adminRouter.route("/get_employee/").get(verifyJWT, getEmployeeProfile);

/* ---------------------------- MANAGE APPS APIs ---------------------------- */

adminRouter.route("/create_app").post(verifyJWT, create_app);
adminRouter.route("/fetch_app").get(verifyJWT, fetch_app);
adminRouter.route("/fetch_active_app").get(verifyJWT, fetch_active_app);
adminRouter.route("/toggle_status/:app_id").patch(verifyJWT, toggle_status);

/* ---------------------- MANAGE RISK & COMPLIANCE APIs --------------------- */

adminRouter.route("/merchant_doc_upload/:merchnatId").put(
  verifyJWT,
  uploadDoc.fields([
    { name: "panAttachment", maxCount: 1 },
    { name: "cancelledChequeAttachment", maxCount: 1 },
    { name: "aadharVoterIdPassportAttachment", maxCount: 1 },
  ]),
  merchantDocUpload
);

adminRouter
  .route("/fetch_merchant_doc_details/:merchantId")
  .get(verifyJWT, fetchUserDocDetails);

adminRouter
  .route("/fetch_merchant_details/:merchantId")
  .get(verifyJWT, fetchUserDetailsById);

adminRouter
  .route("/update_merchant_details/:merchantId")
  .put(verifyJWT, updateUserDetails);
adminRouter
  .route("/update_reasons/:merchantId")
  .put(verifyJWT, updateUserReasonsAndNotify);

/* ----------------------------- MANAGE RESELLER ---------------------------- */

adminRouter.route("/fetch_fresh_merchant").get(verifyJWT, fetchFreshMerchant);
adminRouter
  .route("/convert_reseller/:merchantId")
  .put(verifyJWT, make_reseller);
adminRouter.route("/fetch_reseller").get(verifyJWT, fetchReseller);

adminRouter
  .route("/fetch_reseller_merchant/:resellerId")
  .get(verifyJWT, populateResellersMerchant);
adminRouter.route("/resellers").put(verifyJWT, manageMerchantInArray);

/* -------------------------- MANAGE RESELLER ADMIN ------------------------- */

adminRouter.route("/fetch_fresh_reseller").get(verifyJWT, fetchFreshReseller);
adminRouter
  .route("/convert_reseller_admin/:resellerId")
  .put(verifyJWT, make_reseller_admin);
adminRouter.route("/fetch_reseller_admin").get(verifyJWT, fetchAdminReseller);

adminRouter
  .route("/fetch_reseller_admins_merchant/:resellerAdminId")
  .get(verifyJWT, populateResellerAdminsMerchant);
adminRouter
  .route("/fetch_reseller_admins_reseller/:resellerAdminId")
  .get(verifyJWT, populateResellerAdmins_Reseller);
adminRouter
  .route("/reseller_admin/:resellerAdminId/ra_merchants/:merchantId")
  .put(verifyJWT, manageMerchantIn_RA_Array);

adminRouter
  .route("/reseller_admin/:resellerAdminId/ra_resellers/:resellerId")
  .put(verifyJWT, manageResellerInArray);

/* -------------------------------- SETTINGS -------------------------------- */

adminRouter
  .route("/change_merchant_password/:merchantId")
  .put(verifyJWT, whitelistMiddleware, updatePassword);
adminRouter.route("/fetch_apikeys/:merchantId").get(verifyJWT, getApiKey);
adminRouter.route("/fetch_webhook/:merchantId").get(verifyJWT, getWebhook);

// ______________________________________API WHITELIST ________________
adminRouter.route("/whitelist").post(verifyJWT, createApiWhiteList);
adminRouter.route("/whitelist").get(verifyJWT, getApiWhitelistIp);
adminRouter.route("/whitelist/delete").post(verifyJWT, deleteApiWhiteListIp);
// ___________________________DOMAIN WHITELIST ________________
adminRouter.route("/domain").post(verifyJWT, createDomainWhitelist);
adminRouter.route("/domain").get(verifyJWT, getDomainWhitelist);
adminRouter.route("/domain/delete").post(verifyJWT, deleteWhiteListDomain);
