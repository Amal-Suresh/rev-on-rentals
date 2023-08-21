const mongoose = require('mongoose')

const Partner =mongoose.Schema({
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
    isVerifed:{
        type:Boolean,
        default:false
    },
    city:{
        type:String,
    },
    locations:[{
        name:{type:String}
    }],
    companyName:{
        type:String        
    },
    idProof:{
        type:String,
    }

})
module.exports = mongoose.model("partner",Partner)