const mongoose = require('mongoose')
const bikeSchema =mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    brand:{
        type:String,
        required:true
    },
    image:{
        type:Array,
        required:true
    },
    partnerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'partner',
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
module.exports = mongoose.model("bike",bikeSchema)