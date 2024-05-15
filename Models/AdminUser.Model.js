const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email:{type:String,require:true},
    phone:{type:String,require:true},
    username:{type:String,require:true},
    profile_picture:{type:String,require:true},
    password:{type:String,require:true},
    account_type:{type:String,require:true},
    order:[]
})

const AdminUserModel = mongoose.model("adminuser",UserSchema);

module.exports = {
    AdminUserModel
}