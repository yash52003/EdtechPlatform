const Course = require("../models/Course"); 
const Tag = require("../models/tags");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

//createCourse handler function
exports.createCourse = async (req , res) => {
    try{
      //Step 1 - Fetch the data 
      const {courseName , courseDescription , whatYouWillLearn , price , tag} = req.body;

      //get the thumbnail
      const thumbnail = req.body.thumbnail;

      //Step 2 - Fetch the file


      //Step 3 - Do the validation
      if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail){
        return res.status(400).json({
            success : false,
            message : "All the fields are required and mandatory",
        })
      }

      //Cheak for instructor or not - we would have cheaked this in the middleware then why are we cheaking this now whats the reason. This is not for cheaking when we see the course model of the course we see that we need to store the instructor_id of the course. For that course we need to make a db call 
      //This is not the game of extra validation this is for the db

      //Step4 - cheak for instructor
      //This is a useless db call we can simpl 
      const userId = req.user.id;
      const instructorDetails = await User.findById(userId);
      console.log("Instructor Details" , instructorDetails);
      //Todo - UserId and InstructorDetails.id are same or different 

      //Step 5 - If we don't get any data with respect to the user Id simply return the response 
      if(!instructorDetails){
        return res.status(404).json({
          success : false,
          message : "No Instructor is present corresponding to this database",
        })
      }

      //Step 6 - Cheak if the given tag is valid or not 
      const tagDetails =  await Tag.findById(tag);
      if(!tagDetails){
          return res.status(404).json({
            success : false,
            message : "Tag Details not found",
          });
      }

      //Upload Image to Cloudinary 
      const thumbnailImage = await uploadImageToCloudinary(thumbnail , process.env.FOLDER_NAME);

      //Step 7 - Create and entry for the new course
      const newCourse = await Course.create({
        courseName,
        courseDescription,
        //In instructor we store the reference to the instructor
        instructor : instructorDetails._id,
        whatYouWillLearn : whatYouWillLearn,
        price,
        tag : tagDetails._id,
        thumbnail : thumbnailImage.secure_url, 
      })

      //So we have created out new course 
      //User ko upadate kardo {User - Instructor , Add the course in the userSchema CourseList}
      await User.findByIdAndUpdate(
        {_id : instructorDetails._id} , {
          $push : {
            courses : newCourse._id,
          }
        },
        {new : true},
      )

      //update the tag schema 
      await Tag.findByIdAndUpdate({
        id : tagDetails._id,
      }, {
        $push : {
          course : newCourse._id,
        }
      } ,
      {new : true},
    )

    return res.status(200).json({
      success : true,
      message : "Course Created Successfully",
      data : newCourse,
    });

    }catch(error){
      console.log(error);
      return res.send(500).json({
        success : false,
        message : "Got an Error in Creating the Course",
        error : error.message,
      })
    }
}

//getAllCourses handler function - Show all courses
exports.getAllCourses = async (req , res) => {
  try{

    const allCourses = await Course.find({} , {
      courseName : true,
      price : true,
      thumbnail : true,
      instructor : true,
      ratingAndReview : true,
      studentsEnrolled : true,
    }).populate("instructor").exec();

    return res.status(200).json({
      success : true,
      message : "Data for all courses fetched successfully",
      data : allCourses,
    });

  }catch(error){
    console.log(error);
    return res.status(500).json({
      success : false,
      message : "Error in fetching all the courses",
      error : error.message,
    })
  }
}