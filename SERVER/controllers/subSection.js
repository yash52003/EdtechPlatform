const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

//Create subSection logic
exports.createSubSection = async (req, res) => {
    try {
        // Step 1 - fetch the data from the req body 
        const {
            sectionId,
            title,
            timeDuration,
            description,
        } = req.body;

        // Step 2 - extract the file 
        const video = req.files.videoFile;

        // Step 3 - Do the validation 
        if (!sectionId || !title || !timeDuration || !description || !video) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Step 4 - Upload video to Cloudinary 
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

        // Step 5 - Create the sub-section 
        const subSectionDetails = await SubSection.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            videoUrl: uploadDetails.secure_url,
        });

        // Step 6 - Find the section by ID and push the new sub-section ID to the sub-sections array
        // Log updated section here after adding the populate query
        const updatedSection = await Section.findByIdAndUpdate(
            sectionId,
            { $push: { subSections: subSectionDetails._id } },
            { new: true }
        ).populate('subSections');

        console.log(updatedSection);

        // Step 7 - Return the response 
        return res.status(200).json({
            success: true,
            message: "Sub-section created successfully",
            subSection: subSectionDetails,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "We encountered an error creating the sub-section",
            error : error.message,
        });
    }
};

//HW : updateSubSection






//Hw : deleteSection

