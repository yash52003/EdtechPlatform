const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {passwordUpdated} = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");
const mailSender = require("../utils/mailSender")
require("dotenv").config();

//SendOTP
exports.sendOTP = async (req, res) => {
    try {
      const { email } = req.body
  
      // Check if user is already present
      // Find user with provided email
      const checkUserPresent = await User.findOne({ email })
      // to be used in case of signup
  
      // If user found with provided email
      if (checkUserPresent) {
        // Return 401 Unauthorized status code with error message
        return res.status(401).json({
          success: false,
          message: `User is Already Registered`,
        })
      }
  
      var otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      })
      const result = await OTP.findOne({ otp: otp })
      console.log("Result is Generate OTP Func")
      console.log("OTP", otp)
      console.log("Result", result)
      while (result) {
        otp = otpGenerator.generate(6, {
          upperCaseAlphabets: false,
        })
      }
      const otpPayload = { email, otp }
      const otpBody = await OTP.create(otpPayload)
      console.log("OTP Body", otpBody)
      res.status(200).json({
        success: true,
        message: `OTP Sent Successfully`,
        otp,
      })
    } catch (error) {
      console.log(error.message)
      return res.status(500).json({ success: false, error: error.message })
    }
}

//Signup
exports.signup = async (req , res) => {

    try{

   //Step 1 - fetch the data from the request body
   const {
    firstName, 
    lastName,  
    email, 
    password, 
    confirmPassword,
    accountType, 
    contactNumber,
    otp,
    } = req.body;

   //Step2 - Do the validation of the data
   if(
    !firstName ||
    !lastName || 
    !email || 
    !password || 
    !confirmPassword || 
    !otp
    ){
       return res.status(403).json({
           success : false,
           message : "All fields are required",
       })
   }

   //Step3 - Match both the passwords(password and confirm password)
   if(password !== confirmPassword){
       return res.status(400).json({
           success : false,
           message : "Password and ConfirmPassword Value doesnot match, Please try again",
       })
   }

   //Step4 - Cheak if the user already exists or not [Already an entry is present in the database or not
   const existingUser = await User.findOne({email});
   if(existingUser){
       return res.status(400).json({
           success : false,
           message : "User is already registered. PLlease login to continue",
       })
   }

   //Step5 - Find the most recent otp for the user 
   const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
   console.log(recentOtp);

   //Step6 - Do the validation of the otp {The Input OTP and the OTP which is stored in the database}
   if(recentOtp.length == 0){
      //OTP not found for the email
      return res.status(400).json({
       success : false,
       message : "The OTP is not valid",
      })

   } else if(otp !== recentOtp[0].otp){
       //Ifd the otp value don't matches then we are getting the invalid otp 
       return res.status(400).json({
           success : false,
           message : "Invalid OTP",
       })
   }

   //Step7 - Do the validation of the OTP

   //Step8 - Hash the password
   const hashedPassword = await bcrypt.hash(password , 10);


   
   //Step9 - create and entry in the database

   //In the additional details we give the reference to the profileModel therefore we will need to create a profile before creating the entry into the database reference means we are giving the id of the object in the database that that is uniqurely assigned by the mongodb internally


   //create the user
   let approved= ""
   approved === "Instructor" ? (approved = false) : (approved = true);

   const profileDetails = await Profile.create({
       gender : null,
       dataOfBirth : null,
       about : null,
       contactNumber : null,
   });

   //For the image criteria we can now use a third party service through which we can manage the image of each user - Dice bear
   const user = await User.create({
       firstName , 
       lastName , 
       email,
       contactNumber,
       password : hashedPassword , 

       accountType : accountType,
       approved : approved,
       additionalDetails : profileDetails._id,
       image : "",
       image:  `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
   })

   //Step10  - return the response
   return res.status(200).json({
    success : true,
    message : "User is registered successfully",
    user,
   });

    }catch(error){

        console.log(error);
        return res.status(500).json({
            success : false,
            message : "User cannot be registerd, Please try again",
        });
    }
}

//Login 
exports.login = async (req , res) => {

    try{
        //Step1 - Fetch the data
        const {email , password} = req.body;

        //Step2 - Do the validation of the data
        if(!email || !password){
            return res.status(403).json({
                success : false,
                message : "All fields are required, Please try again",
            })
        }

        //Step3 - Cheak if the user is already present in the database or not
        const user = await User.findOne({email}).populate("additionalDetails");


        //Step4 - If not a registered user then return the response
        if(!user){
            return res.status(401).json({
                success : false,
                message : "The User account is not present , please Signup and come again"
            });
        }

        //Step5 - verify the password The password is hashed which is stored in the database Therefore we will need to use the bcrypt.compare() function

        //Step6 - If the password matches then generate the jwt token and send it to the user with the response that user is loggedin successfully 

        //Match the password and generate the jwt token
        if(await bcrypt.compare(password , user.password)){

            //Generate the jwt after the password matching
            const payload = {
                email : user.email,
                id : user._id,
                role : user.accountType,
            }

            const token = jwt.sign(payload , process.env.JWT_SECRET , {
                expiresIn : "24h",
            });

            //Making a attribute token in the user object as we want to send it to the frontend
            user.token = token;

            //We don't want the client side to see the password after login due to malicious resons therefore we make the password undefined from the copy object that we have created which we are going to send on the client side
            user.password  = undefined;

            //Create cookie and send the response
            const options = {
                expires : new Date(Date.now() + 3*24*60*60*1000),
                   httpOnly : true,
                }

            res.cookie("token" , token , options).status(200).json({
                success : true,
                token,
                user,
                message : "User Login Successfully",
            })


        }
        else{
            return res.status(401).json({
                success : false,
                message : "Password is incorrect",
            })
        }
    }catch(error){
        //If at any step there is an error;
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Login Failure Please try again",
        })
    }
};

//ChangePassword : TODO - Homework Changepassword
exports.changePassword = async (req , res) => {
 try{

  // Get user data from req.user
  const userDetails = await User.findById(req.user.id)

  // Get old password, new password, and confirm new password from req.body
  const { oldPassword, newPassword } = req.body

  // Validate old password
  const isPasswordMatch = await bcrypt.compare(
    oldPassword,
    userDetails.password
  )
  if (!isPasswordMatch) {
    // If old password does not match, return a 401 (Unauthorized) error
    return res
      .status(401)
      .json({ success: false, message: "The password is incorrect" })
  }

  // Update password
  const encryptedPassword = await bcrypt.hash(newPassword, 10)
  const updatedUserDetails = await User.findByIdAndUpdate(
    req.user.id,
    { password: encryptedPassword },
    { new: true }
  )

    //send mail after the password is updated
    //Sending the notification mail
    try{
        const emailResponse = await mailSender(
            updatedUserDetails.email,
            "Password for your account has been updated",
            passwordUpdated(
            updatedUserDetails.email,
            `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`,
            )
        )
        console.log("Email sent successfully:", emailResponse.response);
    }catch(error){
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error)
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      })
    }

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" })

    }catch(error){
    
        console.error("Error occured while updating password: " , error);
    
        return res.status(500).json({
            success : false,
            message : "Error occured while updating the password",
            error : error.message,
        })
    }      
}
