const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Tag", tagSchema);
