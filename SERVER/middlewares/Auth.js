const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

//Auth 
exports.Auth = async (req , res , next) => {
    try{
        //Auth block is used to cheak the authentication It is been done by  cheaking the json webtoken If we are getting the jsonwebtoken then the user is authenticated if we are not getting the jsonwebtoken then the user is not authenticated
        const token = 
        req.cookies.token || 
        req.body.token ||
        req.header("Authorisation").replace("Bearer " , "");

        //If the token is missing then return the response
        //Cookie , body , bearerToken
        if(!token){
            return res.status(401).json({
                success : false,
                message : "Token is missing",
            });
        }

        //We have the token now we need to verify it. We verify the token on the basis of the secret key
        try{
            const decode = await jwt.verify(token , process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
        }
        catch(error){
            //verification issue
            return res.status(401).json({
                success : false,
                message : "Token is invalid",
            })
        }

        next();
    }catch(error){

        return res.status(401).json({
            success : false,
            message : "Something went wrong while validation the token",
        })

    }

}

//isStudent
exports.isStudent = async (req , res , next) => {
    //Very basic code we just need to do the role verify 
    //How know jwt has that payload which has the value of the role 
    //Method2 - Db mai se data 
    try{

        if(req.user.accountType !== "Student"){
            //Simply return the response 
            return res.status(401).json({
                success : false,
                message : "This is a protected route for the students only",
            })
        }

    }catch(error){
        res.status(500).json({
            success : false,
            message : "User role cannot be verified , please try again",
        })
    }

}

//isInstructor
exports.isInstructor = async (req , res , next) => {
    try{
        if(req.user.accountType !== "Instructor" ){
            return res.status(401).json({
                success : false,
                message : "This is a protected route for Instructors only",
            })
        }

    }catch(error){
        res.status(500).json({
            success : false,
            message : "User role cannot be verifie , please try again",
        });
    }

    next();
}

//isAdmin
exports.isAdmin = async (req , res , next) => {
    try{
        if(req.user.accountType !== "Admin" ){
            return res.status(401).json({
                success : false,
                message : "This is a protected route for Admin only",
            })
        }

    }catch(error){
        res.status(500).json({
            success : false,
            message : "User role cannot be verified , please try again",
        });
    }

    next();
}

