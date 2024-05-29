const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    courseName: {
        type: String,
        required: true,
        trim: true,
    },
    courseDescription: {
        type: String,
        required: true,
        trim: true,
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    whatYouWillLearn: {
        type: String,
        trim: true,
    },
    courseContent: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section"
    }],
    ratingAndReviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "RatingsAndReview"
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
        type: [String],
        required : true,
    }],
    category:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Category",
    },
    studentsEnrolled: [{
        type: mongoose.Schema.Types.ObjectId,
        required : true,
        ref: "User"
        },
    ],
    instructions: {
        type: [String],
      },
    status: {
        type: String,
        enum: ["Draft", "Published"],
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Course", courseSchema);
