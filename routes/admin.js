const express =require('express');
const adminRoute=express()
const adminContoller = require("../controller/adminController")

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












module.exports=adminRoute;