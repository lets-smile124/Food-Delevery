import foodModel from "../models/foodModels.js";
import uploadToCloudinary from "../config/uploadToCloudinary.js";
import fs from "fs";
import cloudinary from "../config/cloudinary.js";
//// add food item

export const addFood = async (req, res) => {
    try {

        if (!req.file) {
            return res.json({
                success: false,
                message: "Image not uploaded"
            });
        }

        // Upload image to Cloudinary
        const result = await uploadToCloudinary(req.file.buffer);

        // Save Cloudinary URL in MongoDB
        const food = new foodModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: result.secure_url
        });

        await food.save();

        res.json({
            success: true,
            message: "Food Added"
        });

    } catch (error) {
        console.log(error);

        res.json({
            success: false,
            message: "Error"
        });
    }
};

// all food list
export const listFood = async(req,res)=>{
   try{
     const foods = await foodModel.find({});
     res.json({success:true,data:foods})
   }catch(error){
     console.log(error);
     res.json({success:false,message:"Error"})
   }
}

/// remove food items
export const removeFood = async (req, res) => {
    try {

        const food = await foodModel.findById(req.body.id);

        if (!food) {
            return res.json({
                success: false,
                message: "Food not found"
            });
        }

        // If image is stored on Cloudinary
        if (food.image.startsWith("http")) {

            const url = food.image;

            // Extract public ID from Cloudinary URL
            const uploadPart = url.split("/upload/")[1];

            const parts = uploadPart.split("/");

            // Remove version like v1788855094
            if (parts[0].startsWith("v")) {
                parts.shift();
            }

            // Join folder + filename
            let publicId = parts.join("/");

            // Remove file extension
            publicId = publicId.substring(
                0,
                publicId.lastIndexOf(".")
            );

            await cloudinary.uploader.destroy(publicId);

        } else {

            // Old images stored in backend/uploads
            fs.unlink(`uploads/${food.image}`, (error) => {
                if (error) {
                    console.log("Old image deletion error:", error.message);
                }
            });
        }

        // Delete food from MongoDB
        await foodModel.findByIdAndDelete(req.body.id);

        res.json({
            success: true,
            message: "Food removed"
        });

    } catch (error) {

        console.log(error);

        res.json({
            success: false,
            message: "Error"
        });
    }
};
// export {addFood , listFood}