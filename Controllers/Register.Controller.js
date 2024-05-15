const {AdminUserModel} = require("../Models/AdminUser.Model");
const {StudentUserModel} = require("../Models/StudentUser.Model");
const {GeneralUserModel} = require("../Models/GeneralUser.Model");
const jwt = require('jsonwebtoken');
require("dotenv").config();
const secret = process.env.SECRET;
const bcrypt = require('bcrypt');

const Register = async(req,res)=>{
    const {password,profile_picture,username,phone,email,account_type} = req.body;
    const personexits = await GeneralUserModel.findOne({email}) || await StudentUserModel.findOne({email}) || await AdminUserModel.findOne({email});
    if(personexits?.email){
        res.send({"msg" : "Person Already Exists!"})
    }else{
        bcrypt.hash(password, 5, async function(err, hash) {
            if(err){
                res.send({"msg":"Registration Failed! PLease Try Again"})
            }
            if(account_type == "general"){
                const User = new GeneralUserModel({
                    email,
                    phone,
                    profile_picture,
                    username,
                    password : hash,
                    account_type
                })
                try{
                    await User.save();
                    const tokenise = await GeneralUserModel.findOne({email});
                    const token = jwt.sign({ userId: tokenise._id }, secret);
                    res.json({"msg" : "Registration successfull","token":token})
                }
                catch(err){
                    console.log(err)
                    res.send({"msg":"Something went wrong, plz try again"})
                }
            }
            else if(account_type == "student"){
                const User = new StudentUserModel({
                    email,
                    phone,
                    profile_picture,
                    username,
                    password : hash,
                    account_type
                })
                try{
                    await User.save();
                    const tokenise = await StudentUserModel.findOne({email});
                    const token = jwt.sign({ userId: tokenise._id }, secret);
                    res.json({"msg" : "Registration successfull","token":token})
                }
                catch(err){
                    console.log(err)
                    res.send({"msg":"Something went wrong, plz try again"})
                }
            }
            else if(account_type == "admin"){
                const User = new AdminUserModel({
                    email,
                    phone,
                    profile_picture,
                    username,
                    password : hash,
                    account_type
                })
                try{
                    await User.save();
                    const tokenise = await AdminUserModel.findOne({email});
                    const token = jwt.sign({ userId: tokenise._id }, secret);
                    res.json({"msg" : "Registration successfull","token":token})
                }
                catch(err){
                    console.log(err)
                    res.send({"msg":"Something went wrong, plz try again"})
                }
            }
            
                        
        });
    }
}

module.exports = {
    Register
}