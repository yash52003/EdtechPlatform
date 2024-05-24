const Tag = require("../models/tags");

//create tag handler function
exports.createTag = async (req , res) => {
    try{
        //Fetch the data
        const {name , description} = req.body;

        //Do the validation
        if(!name || !description){
            return res.status(400).json({
                success : false,
                message : "All the fields are required",
            })
        }

        //Crete the entry in the database
        const tagDetails = await Tag.create({
            name : name,
            description : description,
        });
        console.log(tagDetails);

        return res.status(300).json({
            successs : true,
            message : "Tags created successfully",
        })


    }catch(error){
        console.log(error);
        res.status(500).json({
            success : false,
            message : "Error in creating the tag",
        })
    }
};


//getAllTags Handler
exports.showAllTags = async (req , res) => {
    try{
        
        //I dont want to find on the basis on any criteria i want all the entries present in the database just make sure that whatever entruy you bring 
        // -name should be present 
        // -description should be present
        const allTags = await Tag.find({} , {
            name : true,
            description : true,
        });

        return res.status(200).json({
            success : true,
            message : "All tags returned successfully",
            allTags,
        })

    }catch(error){

        console.log(error);
        return res.status(500).json({
            success : false,
            message : "We got an error in getting the Tags",
        })

    }
};