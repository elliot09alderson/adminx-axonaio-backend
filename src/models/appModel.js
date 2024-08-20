import mongoose from "mongoose";
const appSchema = new mongoose.Schema({
    app_id: {
        type: String,
        required: true,
        unique: true,
      },
      app_name: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        enum: ['active', 'inactive'], // Adjust the values based on your requirements
        default: 'inactive',
      },
      added_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin', // Assuming you have a User model to reference
        required: true,
      },
    }, { timestamps: true });

const AppModel = mongoose.model('AppSchema', appSchema);

export default AppModel;