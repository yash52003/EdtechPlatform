const Course = require("../models/Course"); 
const Category = require("../models/Category");
const Section = require("../models/Section");
const SubSection = require("../models/Subsection");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
const CourseProgress = require("../models/CourseProgress")
const { convertSecondsToDuration } = require("../utils/secToDuration")

//createCourse handler function
exports.createCourse = async (req, res) => {
    try {
        // Step 1 - Fetch the data
        let {
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            tag: _tag,
            category,
            status,
            instructions: _instructions,
        } = req.body;

        // Fetch the file
        const thumbnail = req.files?.thumbnailImage;
        if (!thumbnail) {
            return res.status(400).json({ success: false, message: "Thumbnail image is required" });
        }

        const tag = JSON.parse(_tag);
        const instructions = JSON.parse(_instructions);

        // Step 3 - Do the validation
        if (
            !courseName ||
            !courseDescription ||
            !whatYouWillLearn ||
            !price ||
            !tag.length ||
            !instructions.length
        ) {
            return res.status(400).json({
                success: false,
                message: "All Fields are Mandatory",
            });
        }

        if (!status || status === undefined) {
            status = "Draft";
        }

        // Step 4 - Check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        if (!instructorDetails || instructorDetails.accountType !== "Instructor") {
            return res.status(404).json({
                success: false,
                message: "No Instructor is present corresponding to this database",
            });
        }

        // Step 6 - Check if the given tag is valid or not
        const categoryDetails = await Category.findById(category);
        if (!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: "Category Details Not Found",
            });
        }

        // Upload Image to Cloudinary
        const thumbnailImage = await uploadImageToCloudinary(
            thumbnail,
            process.env.FOLDER_NAME
        );

        // Step 7 - Create and entry for the new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn,
            price,
            tag,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
            status,
            instructions,
        });

        // Update the user with the new course
        await User.findByIdAndUpdate(
            { _id: instructorDetails._id },
            { $push: { courses: newCourse._id } },
            { new: true }
        );

        // Add the new course to the Categories
        await Category.findByIdAndUpdate(
            { _id: category },
            { $push: { courses: newCourse._id } },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Course Created Successfully",
            data: newCourse,
        });

    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: "Got an Error in Creating the Course",
                error: error.message,
            });
        }
    }
};

// Edit Course Details
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body
    const updates = req.body
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ error: "Course not found" })
    }

    // If Thumbnail Image is found, update it
    if (req.files) {
      console.log("thumbnail update")
      const thumbnail = req.files.thumbnailImage
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      )
      course.thumbnail = thumbnailImage.secure_url
    }

    // Update only the fields that are present in the request body
    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === "tag" || key === "instructions") {
          course[key] = JSON.parse(updates[key])
        } else {
          course[key] = updates[key]
        }
      }
    }

    await course.save()

    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
};

//getAllCourses handler function - Show all courses
exports.getAllCourses = async (req , res) => {
  try{

    const allCourses = await Course.find(
      { status: "Published" },
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
      }
    )
    .populate("instructor")
    .exec()

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
};

//getCourseDetails
exports.getCourseDetails = async (req, res) => {
  try {
    // Step 1 - get the course details from the request body
    const { courseId } = req.body;

    // Step 2 - Fetch the course. The course was stored in the form of object id
    const courseDetails = await Course.findOne({ _id: courseId }).populate({
      path: "instructor",
      populate: {
        path: "additionalDetails",
      },
    })
    .populate("category")
    .populate({
      path: "courseContent",
      populate: {
        path: "subSection",
        select: "-videoUrl",
      },
    })
    .exec();

    // Validation Step
    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find the course with ID ${courseId}`,
      });
    }

    // Calculate total duration
    let totalDurationInSeconds = 0;

    if (courseDetails.courseContent && courseDetails.courseContent.length > 0) {
      courseDetails.courseContent.forEach((content) => {
        if (content.subSection && content.subSection.length > 0) {
          content.subSection.forEach((subSection) => {
            const timeDurationInSeconds = parseInt(subSection.timeDuration) || 0;
            totalDurationInSeconds += timeDurationInSeconds;
          });
        }
      });
    }

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    // Return successful response
    return res.status(200).json({
      success: true,
      message: "Course Details Fetched Successfully",
      data: {
        courseDetails,
        totalDuration,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Get all courseDetails
exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const userId = req.user.id
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    let courseProgressCount = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })

    console.log("courseProgressCount : ", courseProgressCount)

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgressCount?.completedVideos
          ? courseProgressCount?.completedVideos
          : [],
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
};

// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
  try {
    // Get the instructor ID from the authenticated user or request body
    const instructorId = req.user.id

    // Find all courses belonging to the instructor
    const instructorCourses = await Course.find({
      instructor: instructorId,
    }).sort({ createdAt: -1 })

    // Return the instructor's courses
    res.status(200).json({
      success: true,
      data: instructorCourses,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    })
  }
};

// Delete the Course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body

    // Find the course
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Unenroll students from the course
    const studentsEnrolled = course.studentsEnroled
    for (const studentId of studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      })
    }

    // Delete sections and sub-sections
    const courseSections = course.courseContent
    for (const sectionId of courseSections) {
      // Delete sub-sections of the section
      const section = await Section.findById(sectionId)
      if (section) {
        const subSections = section.subSection
        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId)
        }
      }

      // Delete the section
      await Section.findByIdAndDelete(sectionId)
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId)

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}
