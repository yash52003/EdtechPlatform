const Category = require("../models/Category");

function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}

//createCategory handler function
exports.createCategory = async (req , res) => {
    try{

        const {name , description} = req.body;
        if(!name){
            return res
            .status(400)
            .json({success : false , message : "All fields are required"});
        }

        const CategorysDetails = await Category.create({
            name: name,
            description: description,
          })

          console.log(CategorysDetails)

          return res.status(200).json({
            success: true,
            message: "Categories Created Successfully",
          })

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
        .populate({
                path: "courses",
                match: { status: "Published" },
                populate: "ratingAndReviews",
        })
        .exec();

        console.log("SELECTED COURSE", selectedCategory)

        //Do the validation
        if(!selectedCategory){
            console.log("Category not found");
            return res.status(404).json({
                success : false,
                message : "Data not found",
            });
        }

            // Handle the case when there are no courses
        if (selectedCategory.courses.length === 0) {
        console.log("No courses found for the selected category.")
        return res.status(404).json({
          success: false,
          message: "No courses found for the selected category.",
        })
        }


        //Get courses for different Categories
        const categoriesExceptSelected = await Category.find({
            _id: { $ne: categoryId },
          })

        let differentCategory = await Category.findOne(
            categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
              ._id
          )
        .populate({
            path: "courses",
            match: { status: "Published" },
        })
        .exec()

        console.log(differentCategory);

        //get topSelling course 
        //HW - Write it on your own - Find the top 10 selling courses
            // Get top-selling courses across all categories
        const allCategories = await Category.find()
        .populate({
         path: "courses",
        match: { status: "Published" },
        })
        .exec()
        const allCourses = allCategories.flatMap((category) => category.courses)
        const mostSellingCourses = allCourses
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 10)


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
        return res.status(500).json({
            success : false,
            message : "Internal server error",
            message : error.message,
        })

    }
}

//showAllCategory handler function
exports.showAllCategories = async (req , res) => {
    try {
        const allCategorys = await Category.find({})
        // console.log(allCategorys);
        res.status(200).json({
          success: true,
          data: allCategorys,
        })
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: error.message,
        })
      }
}