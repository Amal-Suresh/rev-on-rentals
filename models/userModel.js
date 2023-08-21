const mongoose = require('mongoose')

const User =mongoose.Schema({
    fname:{
        type:String,
        required:true
    },
    lname:{
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
    image:{
        type:String
    },
    status:{
        type:Boolean,
        default:true
    },
    idProof:{
        type:String,
    }

})
module.exports = mongoose.model("user",User)