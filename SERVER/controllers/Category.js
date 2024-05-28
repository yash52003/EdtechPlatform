const Category = require("../models/Category");

//createCategory handler function
exports.createCategory = async (req , res) => {
    try{

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Error in creating the category",
        })
    }
}

//categoryPageDetails
exports.categoryPageDetails = async (req , res) => {
    try{
        //get CategoryId
        const {categoryId} = req.body;

        //Corresponding to the CategoryId whatEver courses we are having fetch all of them
        const selectedCategory = await Category.findById(categoryId)
        .populate("courses")
        .exec();

        //Do the validation
        if(!selectedCategory){
            return res.status(404).json({
                success : false,
                message : "Data not found",
            });
        }


        //Get courses for different Categories
        const differentCategories =  await Category.find({
                        _id : {$ne : categoryId},
                        }).populate("courses")
                        .exec();

        //get topSelling course 
        //HW - write it on your own 

        //Return all the type of the courses
         return res.status(200).json({
            success : true,
            data:{
                selectedCategory,
                differentCategories,
            },
         });

    }catch(error){
        console.log(error);
        return rs.status(500).json({
            success : false,
            message : error.message,
        })
    }
}


//showAllCategory handler function
exports.showAllCategories = async (req , res) => {

}