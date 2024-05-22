const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");

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
    //Step 1 - fetch the data from the request body
    const {firstName , lastName ,  email , password} = req.body;

    //Step2 - Do the validation of the data

    //Step3 - Match both the passwords(password and confirm password)

    //Step4 - Cheak if the user already exists or not [Already an entry is present in the database or not]

    //Step5 - Find the most recent otp for the user 


    //Step6 - Do the validation of the otp {The Input OTP and the OTP which is stored in the database}

    //Step7 - Do the validation of the OTP

    //Step8 - Hash the password


    //Step9 - create and entry in the database

    //Step10  - return the response
}

//Login 




//ChangePassword


/*
We making the signup and login functionality we will require some of the middlewares for the authorisation purposes
*/