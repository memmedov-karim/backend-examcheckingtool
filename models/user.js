const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    examcenters:[{
        name:{
            type:String,
            required:true
        },
        code:{
            type:String,
            default:null
        },
        location:{
            type:String,
            required:true
        }
    }]
},{timestamps:true})
const User = mongoose.model('users',userSchema);
module.exports = {User};