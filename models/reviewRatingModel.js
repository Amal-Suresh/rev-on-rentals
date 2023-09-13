const mongoose = require('mongoose')

const reviewSchema =mongoose.Schema({
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
    booking:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"booking",
        required:true
    },
    rating:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true
    },
    date:{
        type:String,
        required:true
    }
})
module.exports = mongoose.model("review",reviewSchema)