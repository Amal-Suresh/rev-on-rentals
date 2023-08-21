const express =require('express')
const userRoute= express()
const userController = require('../controller/userController')



 userRoute.post('/otp',userController.sendOtp)
userRoute.post('/verifyOtp',userController.verifyOTP)
userRoute.post('/login',userController.verifyLogin)
userRoute.get('/getBikes',userController.getBikes)


module.exports=userRoute;