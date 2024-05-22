const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    courseName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    courseDescription: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    whatYouWillLearn: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    courseContent: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section"
    }],
    ratingAndReviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "RatingsandReview"
    }],
    price: {
        type: Number,
        required: true,
        min: 0
    },
    thumbnail: {
        type: String,
        trim: true
    },
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag"
    }],
    studentsEnrolled: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model("Course", courseSchema);
