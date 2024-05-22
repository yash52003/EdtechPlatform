const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        trim: true,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    about: {
        type: String,
        trim: true,
        maxlength: 500
    },
    contactNumber: {
        type: String,
        trim: true,
        match: [/^\d{10}$/, 'Please fill a valid 10-digit contact number']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Profile", profileSchema);
