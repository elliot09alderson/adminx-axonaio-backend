import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    emp_id : String,
    avatar: {
      type: String, //cloudinary
      // required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true
    },
    first_name: {
      type: String,
      required: true
    },
    last_name: {
      type: String,
      required: true
    },
    designation: {
      type: String,
      required: true
    },
    personal_email: {
      type: String,
      required: true,
      unique: true
    },
    official_email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    mobile_no: {
      type: String,
      required: true
    },
    last_active: {
      type: Date,
      default: Date.now
    },
    last_password_change: {
      type: Date,
      default: Date.now
    },
    failed_attempts: {
      type: Number,
      default: 0
    },
    prevPassword: {
      type: String,
      default: "",
    },
    is_active: {
      type: Boolean,
      default: false,
    },
    
    is_account_locked: {
      type: Boolean,
      default: false,
    },
    department: {
      type: String,
      required: true,
      enum: [
        'Administration', 
        'Account', 
        'Finance', 
        'Settlement', 
        'Technical', 
        'Networking', 
        'Support', 
        'Marketing', 
        'Sales', 
        'Risk & Compliance', 
        'Legal'
      ]
    },
    role: {
      type: String,
      required: true,
      enum: [
        'CEO', // Chief Executive Officer
        'CFO', // Chief Finance Officer
        'CTO', // Chief Technical Officer
        'IT_Operation_Head',
        'CMO', // Chief Marketing Officer
        'COO', // Chief Operational Officer
        'HR_Manager', // Human Resource Manager
        'Accounting_Head',
        'Finance_Head',
        'Settlement_Head',
        'Technical_Head',
        'Networking_Head',
        'Support_Head',
        'Marketing_Head',
        'Sales_Head',
        'Risk_&_Compliance_Head',
        'Legal',
        'Employee',
        'super_admin'
      ]
    },
    permissions: {
      type: [String],
      default: []
    },
    refreshToken: {
      type: String,
    },
    added_By: { type: mongoose.Schema.Types.ObjectId, ref: "admin",}
  },
  { timestamps: true }
);

// Encrypt the password and previous password
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // Hash the current password
  this.password = await bcrypt.hash(this.password, 10);

  // Hash the previous password if it is different from the current password
  if (this.isModified("prevPassword") && this.prevPassword !== this.password) {
    this.prevPassword = await bcrypt.hash(this.prevPassword, 10);
  }

  next();
});

// Compare the provided password with the hashed password
adminSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

adminSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      official_email: this.official_email,
      username: this.username,
      first_name: `${this.first_name} ${this.last_name}`,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

adminSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const Admin = mongoose.model("admin", adminSchema);
