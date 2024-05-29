const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const mongoose = require("mongoose")

//createRatingandReviews
// exports.createRating = async (req , res) => {
//     try{
//         //Step1 - get the data  , get userID
//         //This userID  we have linked to the request 
//         const userId = req.user.id;

//         //Step2 - Do the validation of the data 
//         const {rating , review , courseId} = req.body;

//         //Cheak that the user is enrolled in the particular course.
//         const Coursedetails = await Course.findOne(
//             { _id : courseId,
//               studentsEnrolled : {
//                 $elemMatch : {$eq : userId}
//             },
//           });

//           if(!courseDetails){
//             return res.status(404).json({
//                 success : false,
//                 message : "Students is not enrolled in the Course",
//             });
//           }


//         //Has the person given multiple reviews -- Therefore cheak if the person have given a review before
//         const alreadyReviewed = await RatingAndReview.findOne({
//                 user:userId,
//                 course:courseId,});

//         if(alreadyReviewed){
//             return res.status(403).json({
//                 success : false,
//                 message : "Course is already reviewed by the user",
//             })
//         }

//         //create the ratingAndReview
//         const ratingReview = await RatingAndReview.create({
//             rating , review , 
//             course : courseId,
//             user : userId,
//         });

//         //Update the course with this rating and review 
//         //We are pushing the id of the RatingAndReview in the courses RatingAndReview folder
//         const updatedCourseDetails = await Course.findByIdAndUpdate({_id : courseId} , 
//             {   
//                 $push: {
//                     ratingAndReviews : ratingReview/_id,
//                 }
//             },
//             {new : true});

//         console.log(updatedCourseDetails);
//         //return the successful response
//         return res.status(200).json({
//             success : true,
//             message : "Rating and Reviews created Successfully",
//             ratingReview,
//         })

//     }catch(error){

//         console.log(error);
//         return res.status(500).json({
//             success : false,
//             message : error.message + "Error in getting the userID",
//         })

//     }
// }

exports.createRating = async (req, res) => {
    try {
      const userId = req.user.id
      const { rating, review, courseId } = req.body
  
      // Check if the user is enrolled in the course
  
      const courseDetails = await Course.findOne({
        _id: courseId,
        studentsEnroled: { $elemMatch: { $eq: userId } },
      })
  
      if (!courseDetails) {
        return res.status(404).json({
          success: false,
          message: "Student is not enrolled in this course",
        })
      }
  
      // Check if the user has already reviewed the course
      const alreadyReviewed = await RatingAndReview.findOne({
        user: userId,
        course: courseId,
      })
  
      if (alreadyReviewed) {
        return res.status(403).json({
          success: false,
          message: "Course already reviewed by user",
        })
      }
  
      // Create a new rating and review
      const ratingReview = await RatingAndReview.create({
        rating,
        review,
        course: courseId,
        user: userId,
      })
  
      // Add the rating and review to the course
      await Course.findByIdAndUpdate(courseId, {
        $push: {
          ratingAndReviews: ratingReview,
        },
      })
      await courseDetails.save()
  
      return res.status(201).json({
        success: true,
        message: "Rating and review created successfully",
        ratingReview,
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }

// //getAverageRating - In this handler we are going to understand the function of the handler
// exports.getAverageRating = async (req , res) => {
//     try{

//         //Lets see how we get the average the rating  -Its a simple three step proccess
        
//         //get courseId
//         const courseID = req.body.courseId;

//         //Db se call maro and calculate the average rating
//         //In the aggregate function - we specify some steps on which it will work
//         const result = await RatingAndReview.aggregate([
//             {
//                 $match:{
//                     course : new mongoose.Types.ObjectId(courseId),
//                 },
//             },
//             {
//                 $group:{
//                     _id : null,
//                     averageRating : {$avg : "$rating"},
//                 }
//             },

//         ])

//         //return rating
//         if(result.length > 0){
//             return res.status(200).json({
//                 success : true,
//                 averageRating : result[0].averageRating,
//             })
//         }

//         //If no rating and review exists 
//         return res.status(200).json({
//             success : true,
//             message : "Average rating is 0 No ratings given till now",
//             averageRating : 0,
//         })


//     }catch(error){
//         console.log(error);
//         return res.status(500).json({
//             success : false,
//             message : "Error in getting the Average Rating of all the Reviews",
//         })
//     }
// }

exports.getAverageRating = async (req, res) => {
    try {
      const courseId = req.body.courseId
  
      // Calculate the average rating using the MongoDB aggregation pipeline
      const result = await RatingAndReview.aggregate([
        {
          $match: {
            course: new mongoose.Types.ObjectId(courseId), // Convert courseId to ObjectId
          },
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
          },
        },
      ])
  
      if (result.length > 0) {
        return res.status(200).json({
          success: true,
          averageRating: result[0].averageRating,
        })
      }
  
      // If no ratings are found, return 0 as the default rating
      return res.status(200).json({ success: true, averageRating: 0 })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve the rating for the course",
        error: error.message,
      })
    }
}

// //getAllRating 
// exports.getAllRatingandReviews = async (req , res) => {
//     try{
//         //Just make a find call and return whatever you are getting 

//         const allReviews = await RatingAndReview.find({})
//         .sort({rating:"desc"})
//         .populate({
//             path : "user",
//             select : "firstName lastName email image",
//         })
//         .populate({
//             path : "course",
//             select : "courseName",
//         })
//         .exec();


//         return res.status(200).json({
//             success : true,
//             meesage : "All review fetch successfully",
//             data: allReviews,
//         })


//     }catch(error){
//         console.log(error);
//         return res.status(500).json({
//             success : false,
//             message : "Error in getting all the ratings"
//         })
//     }
// }
// Get the average rating for a course
// Get all rating and reviews

exports.getAllRatingReview = async (req, res) => {
    try {
      const allReviews = await RatingAndReview.find({})
        .sort({ rating: "desc" })
        .populate({
          path: "user",
          select: "firstName lastName email image", // Specify the fields you want to populate from the "Profile" model
        })
        .populate({
          path: "course",
          select: "courseName", //Specify the fields you want to populate from the "Course" model
        })
        .exec()
  
      res.status(200).json({
        success: true,
        data: allReviews,
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve the rating and review for the course",
        error: error.message,
      })
    }
}


//HW - get the rating review corresponding the courseID
/*
        //fetch the courseId 
        const courseId = req.user.courseId;

        //associated to that course we have the id - rating and review array we will need a populate function


        //return the successResponse

*/