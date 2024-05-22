const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    otp: {
        type: String,
        required: true,
        trim: true,
        minlength: 4,
        maxlength: 6
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 5*60 // 5 minutes
    }
});

module.exports = mongoose.model("OTP", otpSchema);
