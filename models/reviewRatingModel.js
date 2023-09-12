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
    partner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"partner",
        required:true
    },
    rating:{
        type:String,
        required:true
    },
    message:{
        type:Date,
        required:true
    },
    dropTime:{
        type:String,
        required:true
    }
})
module.exports = mongoose.model("review",reviewSchema)