const User  = require("../models/User");
const mailSender = require("../utils/mailSender");

//resetPasswordToken
exports.resetPasswordToken = async (req , res) => {
    try{
        //Fetch the data from the req body - email 

        //Do the validation of the email and cheak the user from this email 

        //geenerate token - this token needs to have an expiration time for which the link is been valid 

        //update user by adding the token and the expiration time

        //Create URL
        //If user exits : generate the link
        const url = `http://localhost:3000/update-password/${token}`;

        //Send Mail containing the URL 


        //Return response

    }catch(error){

    }
}

//resetPassword