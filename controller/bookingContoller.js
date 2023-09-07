const User = require('../models/userModel')
const Bike = require('../models/bikeModel')
const Booking =require('../models/bookingModel')
const Partner = require('../models/partnerModel')


const createBooking =async(req,res)=>{
    try { 
    const bike =await Bike.findOne({_id:req.body.bike})
    const booking = new Booking({
        user:req.id,
        partner:bike.partnerId,
        bike:req.body.bike,
        pickUpTime:req.body.pickUpTime,
        pickUpDate:req.body.pickUpDate,
        dropTime:req.body.dropTime,
        dropDate:req.body.dropDate,
        pickUpPoint:"kalpetta",
        dropPoint:"kalpetta",
        city:req.body.city,
        paymentMethod:"nill",
        paymentStatus:"nill",
        totalAmount:0,
        discountAmount:0
    })
    await booking.save()
    res.status(200).send({success:true,message:"your ride has been booked"})

    } catch (error) {
        console.log(error.message);
        res.status(401).send({success:false,message:"something went wrong"})
        
    }

}

const changeBookingStatus =async(req,res)=>{
    try {
        console.log("reached change status");
        console.log(req.body);
        const changeStat = await Booking.findByIdAndUpdate({ _id: req.body.id }, {
            $set: { status:req.body.value }
        })
        if(changeStat){
            res.status(200).send({success:true,message:"status changed successfully"})
        }else{
            res.status(401).send({success:false,message:"error while changing status"})
        }
        

        
    } catch (error) {
        console.log(error.message);
        res.status(401).send({success:false,message:"error while changing status"})
    }

}

module.exports={
    createBooking,
    changeBookingStatus

}

