const mongoose = require("mongoose");

const courseProgress = new mongoose.Schema({

    courseID : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Course",
    },

    //This field denotes the array of videos
    completedVideos : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "subSection",
        }
    ]

})

module.exports = mongoose.model("courseProgress" , courseProgress);

