const express =require('express')
const partnerRoute = express()
const partnerController=require("../controller/partnerController")
const Auth =require('../middleware/Auth')
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



partnerRoute.post('/join-us',partnerController.receivePartner)
partnerRoute.post('/login',partnerController.verifyLogin)
partnerRoute.post('/addBikes',upload.single('image'),Auth.partnerAuth,partnerController.addBikes)
partnerRoute.get('/viewBikes',Auth.partnerAuth,partnerController.viewBikes)
partnerRoute.get('/changeStatus',Auth.partnerAuth,partnerController.changeStatus)
partnerRoute.post('/forgetpassword',partnerController.forgotPass)
partnerRoute.post('/verifyForgotOtp',partnerController.verifyForgotOtp)






module.exports=partnerRoute;