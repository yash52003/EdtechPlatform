const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
    sectionName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    subSections: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "SubSection"
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model("Section", sectionSchema);
