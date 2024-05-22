const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");

//SendOTP
exports.sendOTP = async (req ,res) => {
    try{
    // Step1 - Fetch email from the request body
    const {email} = req.body;

    //Step2 - Cheak wheather the user already exists in the database or not 
    const existingUser = await User.findOne({email});

    //Step3 - If already user exists then return the response
    if(exisitingUser){
        return res.status(401).json({
            success : false,
            message : "User already registered",
        })
    }

    //Step4 - Generate OTP
    var otp = otpGenerator.generate(6 , {
        upperCaseAlphabets: false,
        lowerCaseAlphabets : false,
        specialChars : false,
    }) ;

    console.log("OTP generated" , otp);

    //Step 5 - I want the otp to be unique
    const result = await OTP.findOne({otp : otp});

    while(result){
        otp = otpGenerator.generate(6 , {
            upperCaseAlphabets: false,
            lowerCaseAlphabets : false,
            specialChars : false,
        }) ;

        result = await OTP.findOne({otp : otp});
    }

    //Step6 - create the otp object and make its unique entry in the database
    const otpPayLoad = {email , otp};

    //Create an entry in the database
    const otpBody = await OTP.create(otpPayLoad);
    console.log(otpBody);


    //return response succesful
    res.status(200).json({
        success : true,
        message : "OTP send successful",
        otp,
    })

    }catch(error){
        console.log(error);
        res.status(500).json({
            success : false,
            message :  'User already exists',
        })
    }
};

//Signup
exports.Signup = async (req , res) => {

    try{

   //Step 1 - fetch the data from the request body
   const {firstName , lastName ,  email , password , confirmPassword , accountType , contactNumber , otp} = req.body;

   //Step2 - Do the validation of the data
   if(!firstName || !lastName || !email || !password || !confirmPassword || !otp || !contactNumber){
       return res.status(403).json({
           success : false,
           message : "All fields are required",
       })
   }

   //Step3 - Match both the passwords(password and confirm password)
   if(password !== confirmPassword){
       return res.status(400).json({
           success : false,
           message : "Password and ConfirmPassword Value doesnot match Please try again",
       })
   }

   //Step4 - Cheak if the user already exists or not [Already an entry is present in the database or not
   const existingUser = await User.findOne({email});
   if(existingUser){
       return res.status(400).json({
           success : false,
           message : "User is already registered",
       })
   }

   //Step5 - Find the most recent otp for the user 
   const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
   console.log(recentOtp);

   //Step6 - Do the validation of the otp {The Input OTP and the OTP which is stored in the database}
   if(recentOtp.length == 0){
      //OTP not found
      return res.status(400).json({
       success : false,
       message : "OTP not found",
      })
   } else if(otp !== recentOtp.otp){
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
       accountType : profileDetails._id,
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
            message : "User cannot be registerd Please try again",
        });

    }

 
}

//Login 




//ChangePassword


/*
We making the signup and login functionality we will require some of the middlewares for the authorisation purposes
*/