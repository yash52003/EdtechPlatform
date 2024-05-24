const cloudinary = require("cloudinary");

exports.uploadImageToCloudinary = async (file , folder , height , quality) => {
    const options = {folder};

    //Height and quality is used for the compress 
    if(height){
        options.height = height;
    }
    if(quality){
        option.quality = quality;
    }
    options.resource_type = "auto";

    return await cloudinary.uploader.upload(file.tempFilePath , options);

};