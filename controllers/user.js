
//EXTERNAL LIBRARUES
const jwt = require("jsonwebtoken");

//MODELS
const {User} = require('../models/user.js');

//HELPERS
const {validateRequiredFields} = require('../helpers/validateRequiredFields.js');

const registeruser = async (req,res,next) => {
    try {
        const {name,email,password} = req.body;
        await validateRequiredFields(req,res,'name','email','password');
        if(password.length<6) throw {status:400,message:'password must have more than 6 characters'};
        const exsistingUser = await User.findOne({email});
        if(exsistingUser) throw {status:400,message:`${email} already exsist`};
        const userInstances = new User({
            name,email,password
        });
        const savedUser = await userInstances.save();
        return res.status(200).json({success:true,message:'You registered successfully'});
    } catch (error) {
        next(error);
    }
}


const loginuser = async (req,res,next) => {
    try {
        const {email,password} = req.body;
        await validateRequiredFields(req,res,'email','password');
        const exsistingUser = await User.findOne({email});
        if(!exsistingUser) throw {status:404,message:`${email} user not found`};
        if(password!==exsistingUser.password) throw {status:400,message:'Password is not correct'};
        const jwtSecretKey = process.env.JWT_SECRET_KEY;
        const token = jwt.sign({ user: exsistingUser._id}, jwtSecretKey);
        const returneduser = await User.findById(exsistingUser._id)
        .select('-password -updatedAt -examcenters');
        // console.log(token);
        res.cookie("user_token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        res.status(200).json({ success: true, data:returneduser,message:'You succesfully loggedin'});
    } catch (error) {
        next(error);
    }
}

const logoutuser = async (req, res,next) => {
    try {
      res
        .clearCookie("user_token", {
          httpOnly: true,
          secure: true,
          sameSite: "None",
          expires: new Date(0),
        })
        .status(200)
        .json({ success: true, message: "Successfully logged out" });
    } catch (error) {
      next(error);
    }
};

const loggedIn = async (req,res,next) => {
    // console.log(req.cookies);
    try {
        const {user:userId} = req.user;
        const returneduser = await User.findById(userId)
        .select('-password -updatedAt -examcenters');
        return res.status(200).json({success:true,data:returneduser})
    } catch (error) {
      next(error);
    }
  };
module.exports = {
    registeruser,
    loginuser,
    logoutuser,
    loggedIn
}