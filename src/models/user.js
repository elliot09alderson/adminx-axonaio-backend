import mongoose from "mongoose";

const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    is_reseller: {
      type: Boolean,
      default: false,
    },
    is_merchant: {
      type: Boolean,
      default: false,
    },
    is_reseller_admin: {
      type: Boolean,
      default: false,
    },  
    is_active: {
      type: Boolean,
      default: false,
    },
    m_id: String,
    r_id: String,
    ra_id: String,
    resellers_merchant: [{ type: Schema.Types.ObjectId, ref: "User" }],
    my_resellers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    reseller_admins_merchant: [{ type: Schema.Types.ObjectId, ref: "User" }],
    phonenumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    prevPassword: {
      type: String,
      default: "",
    },
    prevPrevPassword: {
      type: String,
      default: "",
    },
    attempt: {
      type: Number,
      default: 0,
    },
    isAccess: {
      type: Boolean,
      default: false,
    },
    isEmailVerify: {
      type: Boolean,
      default: false,
    },
    isBasic: {
      type: Boolean,
      default: false,
    },
    merchant_business: {
      type: Boolean,
      default: false,
    },
    app_mode: {
      type: String,
      enum: ["test", "live"],
      default: "test",
    },
    app_permissions : {
      type: [String],
    },
    documents_upload: {
      type: Boolean,
      default: false,
    },
    bg_verified: {
      type: Boolean,
      default: false,
    },
    doc_verified: {
      type: Boolean,
      default: false,
    },
    change_app_mode: {
      type: Boolean,
      default: false,
    },
    create_user_enabled: {
      type: Boolean,
      default: false,
    },
    charge_enabled: {
      type: Boolean,
      default: false,
    },
    is_account_locked: {
      type: Boolean,
      default: false,
    },
    merchant_status: {
      type: Boolean,
      default: false,
    },
    userType: { type: String, default: "merchant" },
  },
  {
    timestamps: true,
  }
);

const User = model("User", UserSchema);

// Create User
export const createUser = async (newUser) => {
  try {
    const user = await User.create(newUser);
    if (user) return { data: user, status: true, msg: "user created" };
  } catch (err) {
    if (err.toString().includes("E11000 duplicate key error collection")) {
      return { data: "Duplicate User", status: false };
    }
  }
  return { data: null, status: false };
};

// User Login
export const loginUser = async (email) => {
  console.log(email);
  let user;
  try {
    user = await User.findOne({ email });
  } catch (err) {
    console.log(err);
  }
  if (user) {
    return { data: user, status: true };
  }
  return { data: "Not successful", status: false };
};

export const findByUserId = async (userId) => {
  let user;
  try {
    user = await User.findOne({ _id: userId });
  } catch (err) {
    console.log(err);
  }
  if (user) {
    return { data: user, status: true };
  }
  return { data: "Not successful", status: false };
};

export default User;
