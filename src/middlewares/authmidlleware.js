import { Admin } from "../models/adminModel.js";
// import {  } from "../utils/.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
/* -------------------------------------------------------------------------- */
/*                            JWT VERIFY USING TOKEN                         */
/* -------------------------------------------------------------------------- */


// export const verifyJWT = asyncHandler(async (req, res, next) => {
//   try {
//     const token = req.cookies?.accessToken || req.header.authorization?.replace("Bearer ", "");
//     // console.log(token)
//     if (!token) throw new Error("Unauthorized access");
    

//     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//     console.log(decodedToken)
//     if (!decodedToken) {
//       throw new Error("Invalid Signature");
//     }

//     const user = await Admin.findById(decodedToken._id).select("-password -refreshToken");
//     console.log(user)

//     if (!user) {
//       throw new Error("Invalid access");
//     }

//     req.user = user;
//     console.log(req.user)
//     next();
//   } catch (error) {
//     res.status(500).json({ status: false, error: error.message });
//   }
// });


export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ status: false, error: "Unauthorized access: No token provided" });
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    if (!decodedToken) {
      return res.status(403).json({ status: false, error: "Invalid Signature" });
    }

    const user = await Admin.findById(decodedToken._id).select("-password -refreshToken");

    if (!user) {
      return res.status(403).json({ status: false, error: "Invalid access: User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ status: false, error: "Unauthorized access: Token expired" });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ status: false, error: "Invalid Signature" });
    } else {
      return res.status(500).json({ status: false, error: error.message });
    }
  }
});

/* ----------------- THIS MIDDLEWARE CODE IS FOR SUPER-ADMIN ---------------- */

export const isSuperAdmin = async (req, res, next) => {
  try {
    const user = await Admin.findById(req.user._id);
    if (!user || user.role !== 'super_admin') {
      return res.status(403).json({ status: false, error: 'Access denied' });
    }
    next();
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

