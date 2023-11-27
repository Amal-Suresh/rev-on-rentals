const express =require('express');
const adminRoute=express()
const adminContoller = require("../controller/adminController")
const couponContoller = require("../controller/couponController")
const multer = require('multer')
const path = require('path');

const storage = multer.diskStorage({
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

adminRoute.get('/partnerRequests',adminContoller.loadPartnerRequests)
adminRoute.put('/changeStatus',adminContoller.changePartnerStatus)
adminRoute.get('/users',adminContoller.loadUsers)
adminRoute.put('/changeUserStatus',adminContoller.changeUserStatus)
adminRoute.get('/rejectPartner',adminContoller.rejectRequest)
adminRoute.get('/sendMailToPartner',adminContoller.sendMailtoPartner)
adminRoute.get('/verifyPartner',adminContoller.verifyPartner)
adminRoute.get('/partnerVerifiedList',adminContoller.loadVerifiedPartners)
adminRoute.post('/login',adminContoller.adminLogin)
adminRoute.get('/fetchChat',adminContoller.fetchUser)
adminRoute.get('/fetchIndividualChat',adminContoller.fetchIndividualChat)
adminRoute.post('/replyToUser',adminContoller.replyToUser)
adminRoute.post('/checkIfAdmin',adminContoller.ckeckIdAdmin)
adminRoute.get('/fetchBookingBikesRevenu',adminContoller.fetchBookingBikesRevenu)
adminRoute.get('/monthlySalesRatio',adminContoller.monthlySalesRatio)

adminRoute.post('/addCoupon',upload.single('image'),couponContoller.addCoupon)
adminRoute.get('/deleteCoupon',couponContoller.deleteCoupon)
adminRoute.get('/changeCouponStatus',couponContoller.changeStatus)
adminRoute.get('/coupons',couponContoller.fetchCoupon)

















module.exports=adminRoute;