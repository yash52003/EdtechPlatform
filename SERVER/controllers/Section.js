const Section = require("../models/Section");
const Course = require("../models/Course");

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
    const updateCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    courseContent : newSection._id,
                }
            },
            {new : true},
    ).populate("");

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

exports.updateSection = async (req , res) => {
    try{
        //Step1 - Take the data in the input
        
        const {sectionId  , sectionName}  = req.body;

        //Step2 - Do the validation of the data
        if(!sectionName || !sectionId){
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


        //Step4 - Return the response 
        return res.status(400).json({
            success : true,
            message : "Section Updated Successfully",
        });


    }catch(error){

        return res.status(500).json({
            success : false,
            message : "Unable to update the section , Please try again",
            error : error.message,
        })

    }
};