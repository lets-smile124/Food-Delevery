import userModel from "../models/userModel.js"
import jwt from "jsonwebtoken" 
import bcrypt from "bcrypt"
import validator from "validator"



const createToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn:"7d"}) // ✅ fix 3
}

/// login user
export const loginUser = async (req,res) => {
  const {email,password} = req.body;
  try{
    const user = await userModel.findOne({email});

    if(!user){
        return res.json({success:false , message:"User dont't exists"})
    }

    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch){
        return res.json({success:false,message:"Invalid credentials"})
    }

    const token = createToken(user._id)
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        address: user.address || ""
      }
    })
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" })
  }
}

export const registerUser = async (req, res) => {
    const { name, password, email } = req.body;
    try {
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            name: name,
            email: email,
            password: hashedPassword
        })

        const user = await newUser.save()
        const token = createToken(user._id)
        res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                address: user.address || ""
            }
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error" })
    }
}

// Get logged-in user's profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.userId || req.body?.userId;
    const user = await userModel.findById(userId).select(
      "name email address"
    );

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });

  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: "Error fetching profile",
    });
  }
};

// Update logged-in user's profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId || req.body?.userId;
    const { name, address } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (address !== undefined) updateData.address = address;

    const user = await userModel.findByIdAndUpdate(userId, updateData, { new: true }).select(
      "name email address"
    );

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error updating profile",
    });
  }
};
// export default {loginUser,registerUser}