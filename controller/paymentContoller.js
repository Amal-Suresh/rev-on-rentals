const Razorpay =require('razorpay')
const crypto =require('crypto');
const { error } = require('console');


const order=async(req,res)=>{
    try {
        console.log("reached order",req.body);
        const instance=new Razorpay({
            key_id:process.env.KEY_ID,
            key_secret:process.env.KEY_SECRET
        });

        const options ={
            amount:req.body.amount*100,
            currency:"INR",
            receipt:crypto.randomBytes(10).toString('hex'),
        };
        instance.orders.create(options,(error,order)=>{
            if(error){
                console.log(error.message);
                return res.status(500).json({success:false, message:"Something went wrong!"})
            }else{
                console.log(order,"order");
                res.status(200).json({success:true,message:"success",data:order})
            }
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({success:false, message:"Something went wrong!"})
        
    }
}


const verify =async(req,res)=>{
    try {
        const {razorpay_order_id,
               razorpay_payment_id,
               razorpay_signature}=req.body

               const sign=razorpay_order_id +'|'+razorpay_payment_id;
               const expectedSign=crypto
               .createHmac("sha256",process.env.KEY_SECRET)
               .update(sign.toString())
               .digest('hex');

               if(razorpay_signature===expectedSign){
                return res.status(200).json({success:true,message:"payment verified successfully"})
               }else{
                return res.status(400).json({success:false,message:"invalid signature sent"})
               }
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({success:false, message:"Something went wrong!"})
        
        
    }
}

module.exports={
    order,
    verify
}