import foodModel from "../models/foodModels.js";
import fs from "fs"

//// add food item

 export const addFood = async (req, res) => {
    try {
        // ✅ Moved inside try-catch + added file check
        if (!req.file) {
            return res.json({ success: false, message: "Image not uploaded" })
        }

        let image_filename = req.file.filename;

        const food = new foodModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: image_filename
        })

        await food.save();
        res.json({ success: true, message: "Food Added" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error" })
    }
}

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
export const removeFood = async(req,res)=>{
   try{
       const food = await foodModel.findById(req.body.id);
       fs.unlink(`uploads/${food.image}`,()=>{})

       await foodModel.findByIdAndDelete(req.body.id);
       res.json({success:true,message:"Food removed"})
   }catch(error){
     console.log(error);
     res.json({success:false , message:"Error"})

   }
}
// export {addFood , listFood}