const express =require('express')
const userRoute= express()
const userController = require('../controller/userController')
const auth=require('../middleware/Auth')
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
userRoute.get('/getBikes',userController.getBikes)
userRoute.get('/checkEmail',userController.checkEmail)
userRoute.post('checkToken',userController.checkIfUser)
userRoute.post('/userProfile',auth.userAuth,userController.userProfile)
userRoute.post('/editUserProfile',upload.single('image'),auth.userAuth,userController.editUserProfile)
userRoute.post('/uploadProof',auth.userAuth,upload.fields([{ name: 'licenseFrontSide' }, { name: 'licenseBackSide' }]),userController.acceptProof)


module.exports=userRoute;