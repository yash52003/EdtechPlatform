const cloudinary = require("cloudinary").v2;
require("dotenv").config();
//Cloudinary is being required

exports.cloudinaryConnect = () => {
    try{
        cloudinary.config({
            // Configuring the Clodinary to upload media
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.API_KEY,
            api_secret: process.env.API_SECRET,
        });
    }catch(error){
        console.log(error);
    };
}