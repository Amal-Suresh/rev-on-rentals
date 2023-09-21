const mongoose= require('mongoose')

const chatSchema=mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    text:{
        type:String,
    },
    createdAt:{
        type:Date
    }
})
module.exports = mongoose.model('chat',chatSchema)