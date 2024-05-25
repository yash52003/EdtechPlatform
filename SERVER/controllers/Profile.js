const User = require("../models/User")
const Profile = require("../models/Profile")

exports.updateProfile = async  (req  , res) => {
    try{   
        //Step1 - get Data 
        const {dateOfBirth = "" , about = "" , contactNumber , gender}  = req.body;

        //get the userId
        const id = req.user.id;

        //Step2 - Do the validation 
        if(!contactNumber || !gender || !id){
            return res.status().json({
                succcess : false,
                message : "All fields are required",
            });
        }


        //Step3 - Find the profile
        //Now we are having only the userID
        const userDetails = await User.findById(id);
        console.log(userDetails);

        //So we can find the profileId from the user Details
        const profileId = userDetails.additionalDetails;


        //Step4 - Update the profile
        const profileDetails = await Profile.findById(profileId);

        //Task for updation of the profile 
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();

        //This is the change in the data that we have fetched we will need to change in the db also -- It is required


        //Step5 - return the response 
        return res.status(200).json({
            success : true,
            message : "Profile Updated Successfully",
            profileDetails,
        });

    }catch(error){
        return res.status(500).json({
            success : false,
            message : "Error in updating the profile",
            error : error.message,
        })
    }
}