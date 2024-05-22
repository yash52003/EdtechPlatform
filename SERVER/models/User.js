const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },

    lastName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },

    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },

    password: {
        type: String,
        required: true,
        minlength: 8
    },

    accountType: {
        type: String,
        enum: ["Admin", "Student", "Instructor"],
        required: true
    },

    additionalDetails: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Profile"
    },

    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    }],

    image: {
        type: String,
        required: true,
        match: [/^https?:\/\/.+\.(jpg|jpeg|png|gif|bmp)$/, 'Please fill a valid image URL']
    },

    courseProgress: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseProgress"
    }]
    
}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);
