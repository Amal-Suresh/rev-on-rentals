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
        type:String,
        default:"notVerified"
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
    aadhaar:{
        type:String,
    },
    pan:{
        type:String,
    },
    gstNo:{
        type:String,
    }

})
module.exports = mongoose.model("partner",Partner)