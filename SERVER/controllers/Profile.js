const User = require("../models/User")
const Profile = require("../models/Profile")

const Course = require("../models/Course")
const User = require("../models/User")
const { uploadImageToCloudinary } = require("../utils/imageUploader")
const mongoose = require("mongoose")
const { convertSecondsToDuration } = require("../utils/secToDuration")

// Method for updating a profile
// exports.updateProfile = async  (req  , res) => {
//     try{   
//         const {
//             firstName = "",
//             lastName = "",
//             dateOfBirth = "",
//             about = "",
//             contactNumber = "",
//             gender = "",
//         } = req.body

//         const id = req.user.id

//         //Step2 - Do the validation 
//         if(!contactNumber || !gender || !id){
//             return res.status().json({
//                 succcess : false,
//                 message : "All fields are required",
//             });
//         }


//         //Step3 - Find the profile
//         //Now we are having only the userID
//         const userDetails = await User.findById(id);
//         console.log(userDetails);

//         //So we can find the profileId from the user Details
//         const profileId = userDetails.additionalDetails;


//         //Step4 - Update the profile
//         const profileDetails = await Profile.findById(profileId);

//         //Task for updation of the profile 
//         profileDetails.dateOfBirth = dateOfBirth;
//         profileDetails.about = about;
//         profileDetails.gender = gender;
//         profileDetails.contactNumber = contactNumber;
//         await profileDetails.save();

//         //This is the change in the data that we have fetched we will need to change in the db also -- It is required


//         //Step5 - return the response 
//         return res.status(200).json({
//             success : true,
//             message : "Profile Updated Successfully",
//             profileDetails,
//         });

//     }catch(error){
//         return res.status(500).json({
//             success : false,
//             message : "Error in updating the profile",
//             error : error.message,
//         })
//     }
// }
// Method for updating a profile
exports.updateProfile = async (req, res) => {
    try {
      const {
        firstName = "",
        lastName = "",
        dateOfBirth = "",
        about = "",
        contactNumber = "",
        gender = "",
      } = req.body
      const id = req.user.id
  
      // Find the profile by id
      const userDetails = await User.findById(id)
      const profile = await Profile.findById(userDetails.additionalDetails)
  
      const user = await User.findByIdAndUpdate(id, {
        firstName,
        lastName,
      })
      await user.save()
  
      // Update the profile fields
      profile.dateOfBirth = dateOfBirth
      profile.about = about
      profile.contactNumber = contactNumber
      profile.gender = gender
  
      // Save the updated profile
      await profile.save()
  
      // Find the updated user details
      const updatedUserDetails = await User.findById(id)
        .populate("additionalDetails")
        .exec()
  
      return res.json({
        success: true,
        message: "Profile updated successfully",
        updatedUserDetails,
      })
    } catch (error) {
      console.log(error)
      return res.status(500).json({
        success: false,
        error: error.message,
      })
    }
}

//Now lets write down the delete account handler 
// exports.deleteAccount = async (req ,res) => {
//     try{
//         //Delete the profile and the user - Fetch the id whose account is to be deleted
//         const id = req.user.id;

//         //Do the validation of the id
//         const userDetails = await User.findById(id);
//         if(!userDetails){
//             return res.status(404).json({
//                 success : false,
//                 message : "User not found",
//             })
//         }

//         //First delete the profile of the user 
//         await Profile.findOneAndDelete({_id : userDetails.additionalDetails});

//         //Delete the User 
//         await User.findOneAndDelete(id);
//         //HW : Todo - Unenroll the user from all the enrolled courses and then delete

//         //Return the response
//         //We just want to give the simple success response 
//         return res.status(200).json({
//             success : true,
//             message : "User Deleted Sucessfully",
//         })


//         //How can we schedule this task of deleting the account

//     }catch(error){
//         console.log(error);
//         res.status(500).json({
//             success : false,
//             message : "Got and error in Deleting the Profile",
//             error : error.message,
//         })
//     }
// }
exports.deleteAccount = async (req, res) => {
    try {
      const id = req.user.id
      console.log(id)
      const user = await User.findById({ _id: id })
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }
      // Delete Assosiated Profile with the User
      await Profile.findByIdAndDelete({
        _id: new mongoose.Types.ObjectId(user.additionalDetails),
      })
      for (const courseId of user.courses) {
        await Course.findByIdAndUpdate(
          courseId,
          { $pull: { studentsEnroled: id } },
          { new: true }
        )
      }
      // Now Delete User
      await User.findByIdAndDelete({ _id: id })
      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      })
      await CourseProgress.deleteMany({ userId: id })
    } catch (error) {
      console.log(error)
      res
        .status(500)
        .json({ success: false, message: "User Cannot be deleted successfully" })
    }
}

//Writing the get handler function for accessing all the details of the user
// exports.getAllUserDetails = async (req , res) => {

//     try{
//        //To get the user all the  details we require the id we get the id easily from the request as the user is logged in 
//        //Step 1 - Get the user ID
//        const id = req.user.id;

//         //Step 2 - Do the validation and get the userDetails
//         if(!id){
//             return res.status(404).json({
//                 success : false,
//                 message : "The id is not approriate"
//             })
//         }
        
//         //Make a db call to get all the details
//         const userDetails = User.findById(id).populate("additionalDetails").exec();
//         //Specifically we have populated the details of the user 

//        //Return the response
//        return res.status(200).json({
//         success : true,
//         message : "User Data Fetched Successfully",
//        });

//     }catch(error){
//         console.log(error);
//         return res.status(500).json({
//             success : false,
//             message : error.message,
//         })
//     }

// }
exports.getAllUserDetails = async (req, res) => {
    try {
      const id = req.user.id
      const userDetails = await User.findById(id)
        .populate("additionalDetails")
        .exec()
      console.log(userDetails)
      res.status(200).json({
        success: true,
        message: "User Data fetched successfully",
        data: userDetails,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
}

exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
}

exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      let userDetails = await User.findOne({
        _id: userId,
      })
        .populate({
          path: "courses",
          populate: {
            path: "courseContent",
            populate: {
              path: "subSection",
            },
          },
        })
        .exec()
      userDetails = userDetails.toObject()
      var SubsectionLength = 0
      for (var i = 0; i < userDetails.courses.length; i++) {
        let totalDurationInSeconds = 0
        SubsectionLength = 0
        for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
          totalDurationInSeconds += userDetails.courses[i].courseContent[
            j
          ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
          userDetails.courses[i].totalDuration = convertSecondsToDuration(
            totalDurationInSeconds
          )
          SubsectionLength +=
            userDetails.courses[i].courseContent[j].subSection.length
        }
        let courseProgressCount = await CourseProgress.findOne({
          courseID: userDetails.courses[i]._id,
          userId: userId,
        })
        courseProgressCount = courseProgressCount?.completedVideos.length
        if (SubsectionLength === 0) {
          userDetails.courses[i].progressPercentage = 100
        } else {
          // To make it up to 2 decimal point
          const multiplier = Math.pow(10, 2)
          userDetails.courses[i].progressPercentage =
            Math.round(
              (courseProgressCount / SubsectionLength) * 100 * multiplier
            ) / multiplier
        }
      }
  
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
}
  
exports.instructorDashboard = async (req, res) => {
    try {
      const courseDetails = await Course.find({ instructor: req.user.id })
  
      const courseData = courseDetails.map((course) => {
        const totalStudentsEnrolled = course.studentsEnroled.length
        const totalAmountGenerated = totalStudentsEnrolled * course.price
  
        // Create a new object with the additional fields
        const courseDataWithStats = {
          _id: course._id,
          courseName: course.courseName,
          courseDescription: course.courseDescription,
          // Include other course properties as needed
          totalStudentsEnrolled,
          totalAmountGenerated,
        }
  
        return courseDataWithStats
      })
  
      res.status(200).json({ courses: courseData })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server Error" })
    }
}

/*
GetcourseDetails
GetSectionDetails
GetSubSectionDetails
*/