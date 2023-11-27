const User = require('../models/userModel')
const Coupon = require('../models/couponModel')
const cloudinary = require('cloudinary')

const addCoupon = async (req, res) => {
    try {

        const { couponName, couponCode, limit, expireDate, maxDiscount, minPurchase, discountValue } = req.body
        const coupon = new Coupon({
            couponName,
            couponCode,
            discountValue,
            minPurchase,
            maxDiscount,
            expireDate,
            limit
        })
        if (req.file) {
            console.log(req.file);
            const result = await cloudinary.uploader.upload(req.file.path, { folder: "CouponIMG" })
            coupon.image = result.secure_url
        }
        const addCoup = await coupon.save();
        if (addCoup) {
            res.status(200).send({ success: true, message: "coupon added successfully" })
        } else {
            res.status(201).send({ success: false, message: "failed to add coupon" })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ success: false, message: "something went wrong" })
    }
}


const changeStatus = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({ _id: req.query.id })
        coupon.status = !coupon.status
        const savedata = await coupon.save()
        if (savedata) {
            res.status(200).send({ success: true, message: "coupon status changed successfully" })
        } else {
            res.status(400).send({ success: false, message: "failed to  change status" })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ success: false, message: "something went wrong" })
    }

}
const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.deleteOne({ _id: req.query.id })
        if (coupon) {
            res.status(200).send({ success: true, message: "coupon deleted" })
        } else {
            res.status(400).send({ success: false, message: "failed to delete coupon" })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ success: false, message: "something went wrong" })
    }
}
const applycoupon = async (req, res) => {
    try {
        let code = req.body.code;
        let amount = req.body.amount;
        let userId = req.id
        let userexist = await Coupon.findOne({
            couponCode: code,
            whoUsed: { $in: [userId] },
        }).lean()
        if (!userexist) {
            const couponData = await Coupon.findOne({ couponCode: code }).lean()
            if (couponData) {
                if (couponData.expireDate >= new Date()) {

                    if (couponData.limit > 0) {

                        if (couponData.minPurchase <= amount) {
                            let discountvalue1 = couponData.discountValue;
                            var discountAmount = Math.floor((discountvalue1 / 100) * amount)
                            if (discountAmount > couponData.maxDiscount) {
                                discountAmount = couponData.maxDiscount
                            }
                            let distotal = amount - discountAmount
                            let discount = discountAmount

                            let details = {
                                discount,
                                code,
                                distotal
                            }
                            res.status(200).send({ success: true, message: "coupon applied", data: details })
                        } else {
                            res.status(201).send({ success: false, message: "purchase for minimum amout" })
                        }
                    } else {
                        res.status(201).send({ success: false, message: "coupon limit reached" })
                    }
                } else {
                    res.status(201).send({ success: false, message: "coupon expired" })
                }
            } else {
                res.status(201).send({ success: false, message: "invalid coupon code" })
            }
        } else {
            res.status(201).send({ success: false, message: "you have already used coupon" })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ success: false, message: "something went wrong" })
    }
};

const fetchCoupon =async(req,res)=>{
    try {
        const coupons=await Coupon.find()
        if(coupons){
            res.status(200).send({success:true,message:"data fetched successfully",data:coupons})
        }else{
            res.status(400).send({success:false,message:"error while fetching data"})
        } 
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ success: false, message: "something went wrong" })  
    }
}

module.exports = {
    addCoupon,
    changeStatus,
    deleteCoupon,
    applycoupon,
    fetchCoupon
}