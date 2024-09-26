import { Admin } from "../models/adminModel.js";
import Otps from "../models/otpModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt, { decode } from "jsonwebtoken";
import randomstring from "randomstring";
import sendEmailOtp from "../utils/sendEmailOtp.js";
import validator from "validator";
import User from "../models/user.js";
import WhiteListApiModel from "../models/whiteListApiModel.js";
// FUNCTION FOR GENERATE EmpID
function generateEmpId() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const minLength = 18;
  const maxLength = 24;
  const length =
    Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  let employeeId = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    employeeId += characters.charAt(randomIndex);
  }

  return employeeId;
}
/* -------------------------------------------------------------------------- */
/*                               GENERATE TOKENS                              */
/* -------------------------------------------------------------------------- */

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await Admin.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    /* -------------------------------------------------------------------------- */
    /*                WE ARE ONLY SAVING THIS REFRESH TOKEN IN DB               */
    /* -------------------------------------------------------------------------- */
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};
/* -------------------------------------------------------------------------- */
/*                                REGISTER USER                               */
/* -------------------------------------------------------------------------- */

const registerUser = asyncHandler(async (req, res) => {
  try {
    const {
      username,
      first_name,
      last_name,
      designation,
      personal_email,
      official_email,
      password,
      mobile_no,
      department,
      role,
    } = req.body;

    console.log("hello", req.body);

    // Check if all required fields are present
    if (
      !username ||
      !first_name ||
      !last_name ||
      !designation ||
      !personal_email ||
      !official_email ||
      !password ||
      !mobile_no ||
      !department ||
      !role
    ) {
      return res.status(400).json({
        status: false,
        error: "Please provide all the details",
      });
    }

    // Trim and validate fields
    const fields = {
      username,
      first_name,
      last_name,
      designation,
      personal_email,
      official_email,
      password,
      mobile_no,
      department,
      role,
    };
    for (const [key, value] of Object.entries(fields)) {
      if (typeof value !== "string" || value.trim() === "") {
        return res.status(400).json({
          status: false,
          error: `Please fill the ${key.replace("_", " ")} field`,
        });
      }
    }
    console.log("hello 2");

    // Validate email formats
    if (
      !validator.isEmail(personal_email) ||
      !validator.isEmail(official_email)
    ) {
      return res
        .status(400)
        .json({ status: false, error: "Invalid email format" });
    }

    // Validate mobile number format (example: simple numeric check)
    if (!/^\d{10}$/.test(mobile_no)) {
      return res
        .status(400)
        .json({ status: false, error: "Invalid mobile number format" });
    }

    // Validate department and role
    const validDepartments = [
      "Administration",
      "Account",
      "Finance",
      "Settlement",
      "Technical",
      "Networking",
      "Support",
      "Marketing",
      "Sales",
      "Risk & Compliance",
      "Legal",
    ];
    const validRoles = [
      "CEO",
      "CFO",
      "CTO",
      "IT_Operation_Head",
      "CMO",
      "COO",
      "HR_Manager",
      "Accounting_Head",
      "Finance_Head",
      "Settlement_Head",
      "Technical_Head",
      "Networking_Head",
      "Support_Head",
      "Marketing_Head",
      "Sales_Head",
      "Risk_&_Compliance_Head",
      "Legal",
      "Employee",
      "super_admin",
    ];

    if (!validDepartments.includes(department)) {
      return res
        .status(400)
        .json({ status: false, error: "Invalid department value" });
    }

    if (!validRoles.includes(role)) {
      return res
        .status(400)
        .json({ status: false, error: "Invalid role value" });
    }

    // Check if username is unique
    console.log("hello 3");

    const usernameExists = await Admin.findOne({ username });
    if (usernameExists) {
      return res
        .status(409)
        .json({ status: false, error: "Username already in use" });
    }
    // Check for unique fields
    const emailExists = await Admin.findOne({
      $or: [{ personal_email }, { official_email }],
    });
    if (emailExists) {
      return res
        .status(409)
        .json({ status: false, error: "Email already in use" });
    }

    // Handle avatar upload
    // const avatarLocalPath = req.files?.avatar[0]?.path;
    // const avatar = avatarLocalPath ? await uploadOnCloudinary(avatarLocalPath) : null;
    // if (!avatar) {
    //   return res.status(400).json({ status: false, error: "Avatar upload failed" });
    // }
    console.log("hello 4");

    // Create new user

    const user = await Admin.create({
      emp_id: generateEmpId(),
      // avatar: avatar.url || "",
      username,
      first_name,
      last_name,
      designation,
      personal_email,
      official_email,
      password,
      mobile_no,
      department,
      role,
      added_By: req.user._id, // Assuming req.user._id contains the ID of the admin who added this user
    });
    console.log("hello 5");

    // Find and return created user without sensitive information
    const createdUser = await Admin.findById(user._id).select(
      "-password -refreshToken"
    );
    if (!createdUser) {
      return res.status(400).json({
        status: false,
        error: "Something went wrong while registering the user",
      });
    }

    return res
      .status(201)
      .json({ status: true, message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
});

/* -------------------------------------------------------------------------- */
/*                                 LOGIN USER                                 */
/* -------------------------------------------------------------------------- */

/* -------------------------------- NEW CODE -------------------------------- */

const MAX_FAILED_ATTEMPTS = 3;

// Generate OTP
function generateOTP() {
  return randomstring.generate({
    length: 6,
    charset: "numeric",
  });
}

const userLogin = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: false,
        error: "Email and password are required",
      });
    }

    const user = await Admin.findOne({ official_email: email });

    if (!user) {
      return res.status(404).json({
        status: false,
        error: "No records found",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        status: false,
        error: "Account is inactive. Please contact the administrator.",
      });
    }

    if (user.is_account_locked) {
      return res.status(403).json({
        status: false,
        error: "Account is locked. Please contact the administrator.",
      });
    }

    const isValid = await user.isPasswordCorrect(password);

    if (!isValid) {
      user.failed_attempts += 1;

      if (user.failed_attempts >= MAX_FAILED_ATTEMPTS) {
        user.is_account_locked = true;
      }

      await user.save();

      const attemptsLeft = MAX_FAILED_ATTEMPTS - user.failed_attempts;
      const errorMessage = user.is_account_locked
        ? "Account is locked due to too many failed login attempts. Please contact the administrator."
        : `Invalid user credentials. You have ${attemptsLeft} attempt${
            attemptsLeft !== 1 ? "s" : ""
          } left.`;

      return res.status(400).json({
        status: false,
        error: errorMessage,
      });
    }

    // Reset failed attempts on successful login
    user.failed_attempts = 0;
    await user.save();

    const otp = generateOTP();
    const newOTP = new Otps({
      email,
      otp,
      createdAt: new Date(),
    });
    await newOTP.save();

    await sendEmailOtp({
      to: email,
      subject: "Your One-Time Password (OTP)",
      message: `
        <p>Dear ${user.first_name} ${user.last_name},</p>
        <p>Your One-Time Password (OTP) is: <strong>${otp}</strong></p>
        <p>Please use this OTP to proceed with your authentication process.</p>
        <p>If you did not request this OTP, please disregard this email.</p>
        <br>
        <p>Best Regards,</p>
        <p>Axon-Tech</p>
      `,
    });

    return res.status(200).json({
      status: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message,
    });
  }
});

/* -------------------------------------------------------------------------- */
/*                                 VERIFY EMAIL OTP                                */
/* -------------------------------------------------------------------------- */

const verifyEmail = asyncHandler(async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!otp)
      return res.status(400).json({ status: false, error: "otp is required" });

    const user = await Admin.findOne({ official_email: email });

    // console.log(user,username,email)
    if (!user) {
      return res.status(404).json({ status: false, error: "no records found" });
    }
    //check if user already present

    // const existingOTP = await Otps.findOneAndDelete({ otp });
    const existingOTP = true;
    console.log(existingOTP);

    if (existingOTP) {
      // OTP is valid
      const { accessToken, refreshToken } =
        await generateAccessAndRefreshTokens(user._id);

      const loggedInUser = await Admin.findById(user._id).select(
        "-password -refreshToken"
      );

      const options = {
        httpOnly: true,
        // secure: true,
      };

      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
          status: true,
          user: loggedInUser,
          accessToken,
          refreshToken,
          message: "user authenticated",
        });
    } else {
      // OTP is invalid
      res.status(400).json({ status: false, error: "Invalid OTP" });
    }
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
});

/* -------------------------------------------------------------------------- */
/*                                 LOGOUT USER                                */
/* -------------------------------------------------------------------------- */

const logOutUser = asyncHandler(async (req, res) => {
  try {
    // Check if user exists
    const user = await Admin.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ status: false, error: "User not found" });
    }

    // Update refresh token and last_active
    await Admin.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          refreshToken: undefined,
          last_active: new Date(), // Update last_active to the current date and time
        },
      },
      { new: true }
    );

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({ status: true, message: "Logged Out Successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, error: error.message });
  }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return res.status().json(401, "unauthorized access !");
  }
  const decodedData = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  if (!decodedData) {
    return res.status(401).json(401, "token expired !");
  }

  const loggedInuser = await Admin.findById(decodedData?._id);

  if (!loggedInuser) {
    return res.status().json(401, "invalid token !");
  }

  if (loggedInuser?.refreshToken !== incomingRefreshToken) {
    return res.status().json(401, "token expired or used");
  }

  const options = { httpOnly: true, secure: true };

  const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(
    loggedInuser._id
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new (200,
      { accessToken, refreshToken: newRefreshToken },
      "tokens Regenerated")()
    );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await Admin.findById(req.user?.id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    return res.status().json(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new (200, {}, "Password changed successfully")());
});

const getCurrentUser = asyncHandler(async (req, res, next) => {
  return res
    .status(200)
    .json(200, req.user, "current user fetched Successfully");
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { first_name, email } = req.body;

  if (!first_name || !email) {
    return res.status().json(400, "All fields are required");
  }
  const user = Admin.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        first_name,
        email,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new (200, user, "Account details updated successfully")());
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const AvatarLocalPath = req.file?.path;
  if (!AvatarLocalPath) {
    return res.status().json(400, "Avatar file is missing");
  }
  const avatar = await uploadOnCloudinary(AvatarLocalPath);
  if (!avatar.url) {
    return res.status().json(400, "Error while uploading the avatar");
  }
  const user = await Admin.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new (200, user, "cover image updated successfully")());
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    return res.status().json(400, "coverimage file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    return res.status().json(400, "Error while uploading the coverimage");
  }
  const user = await Admin.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new (200, user, "cover image updated successfully")());
});

const getUserChannelProfile = asyncHandler(async (req, res, next) => {
  const { username } = req.params;
  if (!username?.trim()) {
    return res.status().json(400, "username is missing");
  }
  const channel = await Admin.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber", //mai kitno ka subscriber hu ?
        as: "subscribedTo",
      },
    },

    {
      $addFields: {
        subscribers: { $ifNull: ["$subscribers", []] },
        subscribedTo: { $ifNull: ["$subscribedTo", []] },
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },

        iSubscribedCount: {
          $size: "$subscribedTo",
        },

        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribedTo.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },

    {
      $project: {
        first_name: 1,
        username: 1,
        subscribersCount: 1,
        iSubscribedCount: 1,
        avatar: 1,
        isSubscribed: 1,
        coverImage: 1,
        email: 1,

        subscribers: 1,
        subscribedTo: 1,
      },
    },
  ]);

  if (!channel?.length) {
    return res.status().json(404, "channel does not exist");
  }
  return res
    .status(200)
    .json(new (200, channel[0], "Admin channel deails fetched")());
});

// ___________________WHITE LIST API CALLS _______________________________
export async function whitelistMiddleware(req, res, next) {
  const origin = req.headers.origin || req.headers.referer;
  console.log("request comming from " + origin);
  const allowedDomain = await WhiteListApiModel.findOne({ ip: origin });
  // Check if the origin is in the allowed domains
  if (origin && allowedDomain) {
    // If the origin is valid, proceed to the next middleware or route handler
    return next();
  }

  // If the origin is not valid, block the request

  return res.status(403).json({
    status: false,
    message: "Access denied. This domain is not allowed to access the API.",
  });
}



export async function createApiBlackList(req, res, next) {
  const { ip } = req.body;
  if (!ip) {
    return res.status(200).json({
      status: false,
      message: "Please Provide Ip ",
    });
  }
  const savedDomain = await WhiteListApiModel.create({
    ip,
    added_By: req.user._id,
  });

  if (savedDomain) {
    return res.status(200).json({
      status: true,
      message: "Ip whitelisted successfully ",
    });
  }
  return res.status(200).json({
    status: false,
    message: "some error occured while whilisting " + ip,
  });
}
export {
  registerUser,
  userLogin,
  verifyEmail,
  updateAccountDetails,
  updateUserCoverImage,
  getUserChannelProfile,
  updateUserAvatar,
  changeCurrentPassword,
  logOutUser,
  getCurrentUser,
  refreshAccessToken,
};
