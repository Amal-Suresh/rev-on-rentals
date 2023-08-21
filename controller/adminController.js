const Partner = require('../models/partnerModel')
const User = require('../models/userModel')
const nodemailer = require('nodemailer')



//send otp to mail
const sMail = ((email) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Partner Request status',
        text: `Your partner request was rejected`
    };

    // send the email
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    })
})


//send otp to mail
const sendMail = ((email) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Update Your Profile',
        html: '<p>Hii' + ',Please click here to <a href="http://localhost:3000/join-us">Reset</a> your password.</p>'
    };

    // send the email
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    })
})



const  loadPartnerRequests = async(req,res)=>{
    try {
        console.log("reached partner requests");
    const partnerReqs = await Partner.find({isVerifed:false})
    console.log(partnerReqs,"partner date");
    if(partnerReqs){
        res.status(200).send({message:"requests featched successfully",success:true,data:partnerReqs})
    }else{
        res.status(200).send({message:"no partner requests found",success:false,nodata:true})
    }
    
        
    } catch (error) {
        res.status(401).send({message:"something went wrong",success:false})
        
    }
}

const changePartnerStatus = async(req,res)=>{
    try {
        const PartnerData = await Partner.findOne({_id:req.query.id})
        PartnerData.status = !PartnerData.status
        await PartnerData.save()
        res.status(200).send({success:true , message:"status changed successfully" ,updatedrequest:PartnerData})
    } catch (error) {
        res.status(401).send({success:false , message:"something went wrong"})  
    }
}

const loadUsers = async(req,res)=>{
    try {
        console.log("kkkkkkk");
        const userData =await User.find()
        if(userData){
            res.status(200).send({success:true,message:"feached data",user:userData})
        }
    } catch (error) {
        res.status(401).send({success:false,message:"Something went wrong"})  
    }
}

const changeUserStatus =async(req,res)=>{
    try {
        console.log("reached change status");
        console.log(req.query.id);
    const userData = await User.findOne({_id:req.query.id})
    userData.status =!userData.status
    await userData.save()
    res.status(200).send({success:true,message:"status changed successfully",updatedUser:userData})
    } catch (error) {
        res.status(401).send({success:false,message:"Something went wrong"})
    }
}

const rejectRequest = async(req,res)=>{
    try {
        console.log("reached reject request");
        console.log(req.query.email);
        sMail(req.query.email)
        const removePartnerReq = await Partner.deleteOne({email:req.query.email})
        if(removePartnerReq){
            res.status(200).send({success:true,message:"request rejected"})
        }else{
            res.status(200).send({success:false,message:"failed to reject request"})
        }
    } catch (error) {
        res.status(401).send({success:false,message:"something went wrong"})  
    }
}

const sendMailtoPartner =async(req,res)=>{
    try {
        sendMail(req.query.email)
        res.status(200).send({success:true,message:"message sented"})
    } catch (error) {
        res.status(401).send({success:false,message:"Something went wrong"})
        
    }
   
}


const verifyPartner=async(req,res)=>{
    try {
        console.log(req.query.email);
        const changeStatus = await Partner.findOne({email:req.query.email})
        changeStatus.isVerifed =!changeStatus.isVerifed
        await changeStatus.save()
        res.status(200).send({success:true,message:"Partner Verified"})
    } catch (error) {
        res.status(401).send({success:false,message:"something went wrong"})
    }
}


const  loadVerifiedPartners = async(req,res)=>{
    try {
        console.log("reached partner requests");
    const partnerReqs = await Partner.find({isVerifed:true})
    console.log(partnerReqs,"partner date");
    if(partnerReqs){
        res.status(200).send({message:"requests featched successfully",success:true,data:partnerReqs})
    }else{
        res.status(200).send({message:"no partner requests found",success:false,nodata:true})
    }
    
        
    } catch (error) {
        res.status(401).send({message:"something went wrong",success:false})
        
    }
}



module.exports={
    loadPartnerRequests,
    changePartnerStatus,
    loadUsers,
    changeUserStatus,
    rejectRequest,
    sendMailtoPartner,
    verifyPartner,
    loadVerifiedPartners
}