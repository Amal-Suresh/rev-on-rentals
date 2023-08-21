const mongoose = require('mongoose')
const Bike =mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    brand:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    partnerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Partner',
        required:true
    },
    category:{
        type:String,
        required:true
    },
    makeYear:{
        type:Number,
        required:true
    },
    rentPerHour:{
        type:Number,
        required:true
    },
    engineCC:{
        type:Number,
        required:true
    },
    plateNumber:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        default:true,
        required:true
    }

})
module.exports = mongoose.model("bike",Bike)