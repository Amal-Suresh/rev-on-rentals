const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    couponName:{
        type:String,
        required:true
    },
    couponCode:{
        type:String,
        required:true
    },
    discountValue:{
        type:Number,
        required:true
    },
    whoUsed:{
        type:Array,
    },
    minPurchase:{
        type:Number,
        required:true,
    },
    maxDiscount:{
        type:Number,
        required:true,
    },
    expireDate:{
        type:Date,
        required    :false
    },
    status:{
        type:Boolean,
        default:false
    },
    limit:{
        type:Number,
        required:true
    },
    image:{
        type:String,
        required:true
    }
})
module.exports =mongoose.model('coupon',couponSchema);