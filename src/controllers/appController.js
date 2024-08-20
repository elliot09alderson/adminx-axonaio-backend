import AppModel from "../models/appModel.js";

// FUNCTION FOR GENERATE appID
function generateAppId() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const minLength = 18;
  const maxLength = 24;
  const length =
    Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  let appId = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    appId += characters.charAt(randomIndex);
  }

  return appId;
}

export const create_app = async (req, res) => {
  try {
    const { _id } = req.user; // Assuming adminId is set in the middleware

    const { app_name, status } = req.body;

    if(!app_name || !status){
        return res.status(400).json({status:false, error:"Please fill all the details"})
    }

    if (!status || (status !== "active" && status !== "inactive")) {
      return res.status(400).json({
        status: false,
        error: "Please select a valid status ('active' or 'inactive')",
      });
    }

    const newApp = new AppModel({
      app_id: generateAppId(),
      app_name,
      status,
      added_by: _id,
    });

    const savedApp = await newApp.save();
    res
      .status(201)
      .json({
        status: true,
        message: "App created successfully",
        data: savedApp,
      });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const fetch_app = async (req, res) => {
  try {
    const apps = await AppModel.find().populate("added_by", "first_name"); // Populate added_by with fields like name, email
    res.status(200).json({status:true, data:apps});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const fetch_active_app = async (req, res) => {
    try {
      // Fetch apps with an active status and populate added_by with the name field
      const apps = await AppModel.find({ status: 'active' }).populate('added_by', 'first_name');
      
      res.status(200).json({ status: true, data: apps });
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
};

export const toggle_status = async (req, res) => {
    try {
      const { app_id } = req.params;

      if(!app_id){return res.status(400).json({status:false, error:"appId is required"})}
  
      // Find the app by app_id
      const app = await AppModel.findOne({ app_id });
  
      if (!app) {
        return res.status(404).json({ status: false, message: 'App not found' });
      }
  
  // Toggle the status
  const newStatus = app.status === 'active' ? 'inactive' : 'active';
  app.status = newStatus;
  await app.save();

  res.status(200).json({
    status: true,
    message: `${app.app_name} has been successfully switched to ${newStatus} mode.`,
  });
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
}

  
