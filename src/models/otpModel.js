import mongoose from "mongoose";
const otpSchema = new mongoose.Schema({
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: false },
});

const Otps = mongoose.model('otps', otpSchema);

export default Otps;