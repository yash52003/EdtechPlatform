const Section = require("../models/Section");
const Course = require("../models/Course");

//CREATE a section
exports.createSection = async (req , res) => {
    try{
        //Step1 - Fetch the data
        const {sectionName , courseId} = req.body;

        //Step2 - Do the validation of the data 
        if(!sectionName || !courseId){
            return res.status(400).json({
                message : false,
                message : "Missing Properties please fill all the details properly, All the fields are required.",
            })
        }

        //Step3 - Create the section
        const newSection = await Section.create({sectionName});

        //Step4 - Update the section in the course {course_content push the section object id of the section}


    //How to use the populate function as we need to populate the section as well as the subsection
    //HW : Use populate to replace sections./sub-sections both in the updatedCourseDetails
      const updatedCourseDetails = await Course.findByIdAndUpdate(
        courseId,
        {
            $push: {
                courseContent: newSection._id,
            }
        },
        { new: true }
    ).populate('courseContent').populate('courseContent.subSection').exec();

      //Step5 - return the success response
      return res.status(200).json({
          success : true,
          message : "Section created Successfully",
          updatedCourseDetails,
      })

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Error in creating the section please try again",
            error : error.message,
        })
    }
}

//UPDATE a section
exports.updateSection = async (req , res) => {
    try{
        //Step1 - Take the data in the input
        
        const {sectionId  , sectionName , courseId}  = req.body;

        //Step2 - Do the validation of the data
        if(!sectionName || !sectionId || !courseId){
            return res.status(400).json({
                success : false,
                message : "Missiong Properties Please Fill the details again and carefully",
            })
        }

        //Step3 - Update the data 
        const updateSectionDetails = await Section.findByIdAndUpdate(sectionId , 
        {sectionName},
        {new : true,}
        );

        const course = await Course.findById(courseId)
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec()
        console.log(course);


        //Step4 - Return the response 
        return res.status(400).json({
            success : true,
            message : "Section Updated Successfully",
            data : course,
        });


    }catch(error){

        console.error("Error updating section:", error)
        return res.status(500).json({
            success : false,
            message : "Unable to update the section , Please try again",
            error : error.message,
        })

    }
};

// DELETE a section
exports.deleteSection = async (req, res) => {
    try {
      const { sectionId, courseId } = req.body
      await Course.findByIdAndUpdate(courseId, {
        $pull: {
          courseContent: sectionId,
        },
      })
      const section = await Section.findById(sectionId)
      console.log(sectionId, courseId)
      if (!section) {
        return res.status(404).json({
          success: false,
          message: "Section not found",
        })
      }
      // Delete the associated subsections
      await SubSection.deleteMany({ _id: { $in: section.subSection } })
  
      await Section.findByIdAndDelete(sectionId)
  
      // find the updated course and return it
      const course = await Course.findById(courseId)
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec()
  
      res.status(200).json({
        success: true,
        message: "Section deleted",
        data: course,
      })
    } catch (error) {
      console.error("Error deleting section:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
};
  
