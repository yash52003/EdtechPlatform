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

//Now lets write down the delete account handler 
exports.deleteAccount = async (req ,res) => {
    try{
        //Delete the profile and the user - Fetch the id whose account is to be deleted
        const id = req.user.id;

        //Do the validation of the id
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success : false,
                message : "User not found",
            })
        }

        //First delete the profile of the user 
        await Profile.findOneAndDelete({_id : userDetails.additionalDetails});

        //Delete the User 
        await User.findOneAndDelete(id);
        //HW : Todo - Unenroll the user from all the enrolled courses and then delete

        //Return the response
        //We just want to give the simple success response 
        return res.status(200).json({
            success : true,
            message : "User Deleted Sucessfully",
        })


        //How can we schedule this task of deleting the account

    }catch(error){
        console.log(error);
        res.status(500).json({
            success : false,
            message : "Got and error in Deleting the Profile",
            error : error.message,
        })
    }
}

//Writing the get handler function for accessing all the details of the user
exports.getAllUserDetails = async (req , res) => {
    
}