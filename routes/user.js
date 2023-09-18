const express =require('express')
const userRoute= express()
const userController = require('../controller/userController')
const auth=require('../middleware/Auth')
const bookingContoller = require('../controller/bookingContoller')
const paymentContoller=require('../controller/paymentContoller')
const multer = require('multer')
const path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, path.join(__dirname,"../public/bikes"), function(error, success) {
        if (error) {
          console.log(error);
        }
      });
    },
    filename: function(req, file, cb) {
      const name = Date.now()+"-"+file.originalname;
      cb(null, name, function(error, success) {
        if (error) {
          console.log(error);
        }
      });
    }
  });
  const upload = multer({ storage: storage });



userRoute.post('/verifyOtp',userController.verifyOTP)
userRoute.post('/login',userController.verifyLogin)
userRoute.get('/getBikes',userController.getBikes2)
userRoute.get('/checkEmail',userController.checkEmail)
userRoute.post('checkToken',userController.checkIfUser)
userRoute.post('/userProfile',auth.userAuth,userController.userProfile)
userRoute.post('/editUserProfile',upload.single('image'),auth.userAuth,userController.editUserProfile)
userRoute.post('/uploadProof',auth.userAuth,upload.fields([{ name: 'licenseFrontSide' }, { name: 'licenseBackSide' }]),userController.acceptProof)
userRoute.get('/retriveCities',userController.findCities)
userRoute.post('/booking',auth.userAuth,bookingContoller.createBooking)
userRoute.post('/userRides',auth.userAuth,userController.getBookings)
userRoute.post('/cancelRide',auth.userAuth,userController.cancelRide)
userRoute.post('/bookbike',paymentContoller.order)
userRoute.post('/resendOtp',userController.resendOtp)
userRoute.post('/forgetpassword',userController.forgotPassword)
userRoute.post('/forgetPassResendOtp',userController.forgotPasswordResendOtp)
userRoute.post('/verifyForgotOtp',userController.verifyForgotOtp)
userRoute.get('/getBikeDetails',userController.getBikeDetails)
userRoute.post('/verifyPayment',auth.userAuth,paymentContoller.verify)
userRoute.get('/findOrder',userController.findOrder)
userRoute.post('/ratingAndReview',userController.ratingAndReview)
userRoute.post('/checkIfUser',userController.checkIfUser)












module.exports=userRoute;