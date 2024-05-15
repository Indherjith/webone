const {GeneralUserModel} = require("../Models/GeneralUser.Model");
const {StudentUserModel} = require("../Models/StudentUser.Model");
const {AdminUserModel} = require("../Models/AdminUser.Model");
const jwt = require('jsonwebtoken');
require("dotenv").config();
const secret = process.env.SECRET;
const bcrypt = require('bcrypt');

const Login = async(req,res)=>{
    const {password,email} = req.body;
    const personexits = await GeneralUserModel.findOne({email}) || await StudentUserModel.findOne({email}) || await AdminUserModel.findOne({email});
    if(personexits?.email){
        const hash = personexits.password
        bcrypt.compare(password, hash, function(err, result) {
            if(err){
                res.send({"msg":"Wrong Password!"});
            }
            if(result){
                const token = jwt.sign({ userId : personexits._id }, secret);
                res.send({"msg" : "Login successfull", token})
            }
            else{
                res.send({"msg":"Invalid credentials, plz signup if you haven't"})
            }
        });
    }else{
        res.send({"msg" : "Person Not Exists!"})
    }
}

module.exports = {
    Login
}