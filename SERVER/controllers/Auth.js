const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

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
exports.signup = async (req , res) => {

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
        const user = await User.findOne({email}).populate("addditionalDetails");


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
                expiresIn : "2h",
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
                message : "User Loggedin Successfully",
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
        return res.status(401).json({
            success : false,
            message : "Login Failure Please try again",
        })
    }

};

//ChangePassword : TODO - Homework Changepassword
exports.changePassword = async (req , res) => {
    //get data from the req body
    //get oldPassword , newPassword , confirmNewPassword
    const {email , oldPassword , newPassword , confirmNewPassword} = req.body;
    //validation
    
        if(!oldPassword || !newPassword || !confirmNewPassword){
            res.send(403).json({
                success : false,
                message : "All the fields are neccessary , Please try again",
            })
        }

    //update pwd in the database 
    if(newPassword == confirmNewPassword){
        const user = await User.findOne({email});

        const hashedPassword = await bcrypt.hash(password , 10);

        user.password = hashedPassword ;
        
        //I  new to update the user details in the database forthat purpose I will need to use the Put crud operation




    }else{
        return res.status(401).json({
            success : false,
            message : "The newPassword and the confirmNewPassword doesn't matches please enter again"
        })
    }
    //send mail after the password is updated
    
    
}

/*
We making the signup and login functionality we will require some of the middlewares for the authorisation purposes
*/