import merchantDocModel from "../models/userDocDetails/userDocDetails.js";
import User from "../models/user.js";

/* ------------------- FETCH THE MERCHANT DOCUMENT DETAILS ------------------ */

export const fetchUserDocDetails = async (req, res) => {
  try {
    const merchantId = req.params.merchantId;
    if (!merchantId) {
      return res
        .status(400)
        .json({ status: false, error: "merchantId missing" });
    }

    const userDocDetails = await merchantDocModel.findOne({ m_id: merchantId });
    if (userDocDetails) {
      res.status(200).json({
        status: true,
        message: "fetched successfully",
        data: userDocDetails,
      });
    } else {
      res.status(404).json({ status: false, error: "no records found!" });
    }
  } catch (error) {
    //   console.log(error)
    return res.status(500).json({ status: false, error: error.message });
  }
};

/* ----------------- UPDATE THE USERDOCDETAILS MERCHANT WISE ---------------- */

export const merchantDocUpload = async (req, res) => {
  try {
    const merchantId = req.params.merchantId;
    if (!merchantId) {
      return res
        .status(400)
        .json({ status: false, error: "merchantId missing" });
    }

    let updateData = {};

    // Handling file attachments if present
    if (req.files) {
      if (req.files["panAttachment"]) {
        updateData.panAttachment = req.files["panAttachment"][0].filename;
      }
      if (req.files["cancelledChequeAttachment"]) {
        updateData.cancelledChequeAttachment =
          req.files["cancelledChequeAttachment"][0].filename;
      }
      if (req.files["aadharVoterIdPassportAttachment"]) {
        updateData.aadharVoterIdPassportAttachment =
          req.files["aadharVoterIdPassportAttachment"][0].filename;
      }
    }

    // Handling other form data
    const fieldsToUpdate = [
      "companyName",
      "businessType",
      "businessCategory",
      "description",
      "website",
      "city",
      "state",
      "address",
      "pincode",
      "accountHolderName",
      "accountType",
      "accountNumber",
      "confirmAn",
      "ifscCode",
      "branchName",
      "panNumber",
      "aadharVoterIdPassportDLNumber",
      "gstNumber",
      "cancelledCheque",
      "companyPan",
      "registrationCertificate",
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field]) {
        updateData[field] = req.body[field];
      }
    });

    // Ensure merchant exists
    const userCheck = await User.findOne({ m_id: merchantId });
    if (!userCheck) {
      return res.status(404).json({ status: false, error: "No records found" });
    }

    // Update or upsert the document with new data
    const userDocDetails = await merchantDocModel.updateOne(
      { m_id: merchantId },
      { $set: updateData },
      { upsert: true }
    );
    // console.log("Document details updated");

    let updatedUserData;

    if (userDocDetails) {
      // If all the necessary attachments are present, update user status
      if (
        updateData.panAttachment &&
        updateData.aadharVoterIdPassportAttachment &&
        updateData.cancelledChequeAttachment
      ) {
        updatedUserData = await User.updateOne(
          { m_id: merchantId },
          { isBasic: true, documents_upload: true, bg_verified: true }
        );
        // console.log("User details updated");
      }
    }

    // Fetch updated user data, excluding sensitive fields
    const user = await User.findOne({ m_id: merchantId }).select(
      "-_id -password  -prevPassword "
    );

    return res.status(200).json({
      message: "Merchant Document Uploaded successfully",
      user,
      status: true,
    });
  } catch (error) {
    // console.error("Error during onboarding:", error);
    return res.status(500).json({ status: false, error: error.message });
  }
};
export const fetchUserDetailsById = async (req, res) => {
  try {
    const merchantId = req.params.merchantId;

    if (!merchantId) {
      return res
        .status(400)
        .json({ status: false, error: "merchantId missing" });
    }

    const userDetails = await User.findOne({ m_id: merchantId }).select(
      "-_id -password -prevPassword -prevPrevPassword"
    );

    if (!userDetails) {
      return res.status(400).json({ status: false, error: "no records found" });
    }

    return res.status(200).json({
      status: true,
      message: "fetched Merchant Details Successfully",
      data: userDetails,
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};
// ______________ UPDATE USER DETAILS ________________________
export const updateUserDetails = async (req, res) => {
  try {
    const merchantId = req.params.merchantId;

    if (!merchantId) {
      return res
        .status(400)
        .json({ status: false, error: "merchantId missing" });
    }

    // Find the user details by merchant ID
    const userDetails = await User.findOne({ m_id: merchantId }).select(
      "-_id -password -prevPassword -prevPrevPassword"
    );

    if (!userDetails) {
      return res.status(400).json({ status: false, error: "No records found" });
    }

    // Create an object to hold the fields to be updated
    const updateFields = {};

    // Check and add the fields to update if they exist in the request body
    if (req.body.name) updateFields.name = req.body.name;
    if (req.body.email) updateFields.email = req.body.email;
    if (req.body.phoneNumber) updateFields.phoneNumber = req.body.phoneNumber;

    // Handle the boolean bg_verified field
    if (typeof req.body.bg_verified === "Boolean") {
      updateFields.bg_verified = req.body.bg_verified;
      updateFields.doc_verified = req.body.doc_verified;
    }

    // If no fields are provided for update
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        status: false,
        error: "No fields provided for update",
      });
    }

    // Update the user details
    const updatedUser = await User.findOneAndUpdate(
      { m_id: merchantId },
      { $set: updateFields },
      { new: true }
    ).select("-_id -password -prevPassword -prevPrevPassword");

    return res.status(200).json({
      status: true,
      message: "User details updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};
// ______________ UPDATE USER REASONS ________________________

export const updateUserReasonsAndNotify = async (req, res) => {
  try {
    const { merchantId } = req.params;
    const { reasons } = req.body; // reasons should be an array of strings

    if (!merchantId) {
      return res
        .status(400)
        .json({ status: false, error: "merchantId missing" });
    }

    if (!reasons || !Array.isArray(reasons) || reasons.length === 0) {
      return res
        .status(400)
        .json({ status: false, error: "reasons array missing or empty" });
    }

    const user = await User.findOne({ m_id: merchantId });

    if (!user) {
      return res.status(404).json({ status: false, error: "No records found" });
    }

    // Update the reasons array in the user model
    user.reason = reasons;
    await user.save();

    // // Set up Nodemailer for sending the email
    // const transporter = nodemailer.createTransport({
    //   service: 'your_email_service', // e.g., 'gmail'
    //   auth: {
    //     user: 'your_email@example.com',
    //     pass: 'your_email_password',
    //   },
    // });

    // const mailOptions = {
    //   from: 'your_email@example.com',
    //   to: user.email,
    //   subject: 'Action Required: Issues with Your Merchant Account',
    //   text: `Dear ${user.name},\n\nThere are some issues with your account:\n\n${reasons.map((reason, index) => `${index + 1}. ${reason}`).join('\n')}\n\nPlease address these issues as soon as possible.\n\nBest regards,\nYour Company`,
    // };

    // Send the email
    // await transporter.sendMail(mailOptions);

    await sendEmail({
      to: email,
      subject: "Action Required: Issues with Your Merchant Account",
      message: `
      <p>Dear ${user.name} </p>
      <p>We have reviewed your account and found the following issues:</p>
      <ul>
        ${reasons.map((reason) => `<li>${reason}</li>`).join("")}
      </ul>
      <p>Please address these issues as soon as possible.</p>
      <p>If you have any questions or need assistance, feel free to contact us.</p>
      <br>
      <p>Best Regards,</p>
      <p>Axon-Tech</p>
    `,
    });

    res.status(200).json({
      status: true,
      message: "Reasons updated and email sent to the merchant",
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};
