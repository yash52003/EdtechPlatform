const User  = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

//resetPasswordToken
//This function has the job of sending the Frontend ui link to the user on his mail
exports.resetPasswordToken = async (req , res) => {
    try{
        //Fetch the data from the req body - email 
        const email = req.body.email;

        //Do the validation of the email and cheak the user from this email 
        if(!email){
            return res.status(401).json({
                success : false,
                message : "Please fill all the details correctly",
            })
        }

        const user = await User.findOne({email});

        if(!user){
            return res.status(402).json({
                success : false,
                message : "The given user doesnot exist please Signup first",
            });
        }

        //geenerate token - this token needs to have an expiration time for which the link is been valid crytp library
        const token = crypto.randomUUID();

        //update user by adding the token and the expiration time
        const updatedDetails = await User.findOneAndUpdate({email : email} , {
            token : token ,
            resetPasswordExpires : Date.now() + 5*60*1000,
        } , {new:true});

        //Create URL
        //If user exits : generate the link
        const url = `http://localhost:3000/update-password/${token}`;

        //Send Mail containing the URL 
        //Lets send the mail 
        await mailSender(email , "Password reset Link" ,  
        `Password reset Link : ${url}`
        );

        //Return response
        return res.json({
            success : true,
            message : "Email Sent Successfully Please cheak the email and change the password",
        })


    }catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Somethign went wrong in the reset Password Functionality",
        })
    }
}

//resetPassword
//This function is been used where we are going to actual reset the password 
exports.resetPassword = async (req , res) => {
    try{
        //Fetch data from the request body
        const {token , password , confirmPassword} = req.body;


        //Do the validation of the data 
        if(!token || !password || !confirmPassword){
            return res.status(401).json({
                success : false,
                message : "All the fields are neccessary please Input the data accurately",
            })
        }

        if(password !== confirmPassword){
            return res.status(403).json({
                success : false,
                message : "The confirmPassword and the Password doesn't matches Please enter the fields again",
            })
        }

        //use the token and take out the user entry from the database
        const userDetails = await User.findOne({token});

        if(!userDetails){
            return res.json({
                success : false,
                message : "The token is invalid",
            })
        }

        //If no entry invalid token return the response  and cheak for the token time
        if(userDetails.resetPasswordExpires < Date.now()){
            //It means the token has expired
            return res.status(500).json({
                success : false,
                message : "The token has been expired, Please regenerate your token",
            })
        }

        //Hash the password
        const hashedPassword = await bcrypt.hash(password , 10);

        //Update the user entry database password for that purpose first hash the password 
        await User.findOneAndUpdate({token} , {
            password : hashedPassword,
        } , {new:true});

        //Next step is to update the password 


        //Return the response
        return res.status(200).json({
            success : true,
            message : "Password reset is been successful",
        })

    }catch(error){

        console.log(error);
        return res.status(500).json({
            success : false,
            message : "There was and error in reseting the password",
        });

    }
};

