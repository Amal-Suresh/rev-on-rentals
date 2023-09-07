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
    totalAmount:{
        type:Number,
        required:true
    },

    discountAmount:{
        type:Number,
    },
    status:{
        type:String,
        default:"booked"
    }

})
module.exports = mongoose.model("booking",bookingSchema)