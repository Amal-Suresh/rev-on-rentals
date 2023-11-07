const User = require('../models/userModel')
const Coupon = require('../models/couponModel')

const addCoupon =async (req,res)=>{
    try {
        const {couponName,couponCode,discountValue,minPurchase,maxDiscount,expireDate,limit} = req.body
        const coupon = new Coupon({
            couponName,
            couponCode,
            discountValue,
            minPurchase,
            maxDiscount,
            expireDate,
            limit 
        }) 
        const addCoup = await coupon.save(); 
        if(addCoup){
            res.status(200).send({success:true, message:"coupon added successfully"})
        }else{
            res.status(201).send({success:false, message:"failed to add coupon"})
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send({success:false, message:"something went wrong"})  
    }
}


module.exports={
    addCoupon
}