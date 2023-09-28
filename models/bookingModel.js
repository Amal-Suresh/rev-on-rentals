const mongoose = require('mongoose')

const bookingSchema =mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    bike:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"bike",
        required:true
    },
    partner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"partner",
        required:true
    },
    pickUpTime:{
        type:String,
        required:true
    },
    pickUpDate:{
        type:Date,
        required:true
    },
    dropTime:{
        type:String,
        required:true
    },
    dropDate:{
        type:Date,
        required:true
    },
    receviedTime:{
        type:String,
        
    },
    receviedDate:{
        type:Date,
      
    },
    pickUpPoint:{
        type:String,
        required:true
    },
    dropPoint:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    paymentMethod:{
        type:String,
       
    },
    paymentStatus:{
        type:String,
       
    },
    helmet:{
        type:String,
       
    },
    rent:{
        type:String,
       
    },
    grandTotal:{
        type:Number,
    },
    totalAmount:{
        type:Number,
        required:true
    },

    discountAmount:{
        type:Number,
    },
    additionalAmount:{
        type:Number,
        default:0
    },
    status:{
        type:String,
        default:"booked"
    },
    date:{
        type:Date,
    }
})
module.exports = mongoose.model("booking",bookingSchema)