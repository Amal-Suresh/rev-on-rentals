const nodemailer = require('nodemailer')
const User = require('../models/userModel')
const Bike = require('../models/bikeModel')
const Booking =require('../models/bookingModel')
const bcrypt = require('bcryptjs');
const jwt    =require('jsonwebtoken')
const Partner = require('../models/partnerModel')
const cloudinary =require('../utils/cloudinery')

const hashPassword = (password)=>{
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt); 
    return hash; 
}

const comparePassword = (plainPassword,hashed)=>{
    verifyPassword = bcrypt.compareSync(plainPassword, hashed);
     return verifyPassword;
 }


//send otp to mail
const sMail = ((email, otp) => {
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
        subject: 'Your OTP',
        text: `Your OTP is ${otp}`
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


//create map for storing email and otp
const emailOTPDateMap = new Map();

function setOTP(email, otp) {
    const currentDate = new Date();
    emailOTPDateMap.set(email, { otp, date: currentDate });
}


function getOTPAndDate(email) {
    const entry = emailOTPDateMap.get(email);
    if (entry) {
        const currentTime = new Date();
        const timeDifferenceInMilliseconds = currentTime - entry.date;
        const timeDifferenceInMinutes = timeDifferenceInMilliseconds / (1000 * 60);

        if (timeDifferenceInMinutes <= 5) {
            return { otp: entry.otp, date: entry.date };
        } else {
            emailOTPDateMap.delete(email);
            return undefined;
        }
    } else {
        return undefined;
    }
}

const verifyOTP = async (req, res) => {
    try {
        const { fname, lname, email, password, mobile } = req.body.data
        const result = getOTPAndDate(email);
        if (result) {
            if (result.otp == req.body.otp) {
                const hash =hashPassword(password)
                const userData = new User({
                    fname,
                    lname,
                    email,
                    mobile,
                    password:hash
                })
                await userData.save()
                emailOTPDateMap.delete(email);
                res.status(200).send({ success: true, message: "successfully registered" })
            } else {
                res.status(200).send({ success: false, message: "Wrong Otp" })
            }
        } else {
            res.status(200).send({ success: false, message: "otp expired" })
        }
    } catch (error) {
        res.status(401).send({ success: false, message: "something went Wrong" })
    }
}

const verifyLogin = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.body.email })
        if(userData){
            const camparePass =comparePassword(req.body.password,userData.password)
        if (camparePass) {
            const token =jwt.sign({id:userData._id,role:"user"},process.env.JWT_SECRET_KEY,{expiresIn:'1d'})
            const data ={
                username:`${userData.fname} ${userData.lname}`,
                token:token
            }
            res.status(200).send({ success: true, message: "login successfull" ,data})
        } else {
            res.status(200).send({ success: false, message: "invalid username or password" })
        }
        }else{
            res.status(200).send({ success: false, message: "invalid username or password" })
        }
    } catch (error) {
        res.status(401).send({ success: false, message: "something went wrong" })
    }
}



const checkEmail = async (req, res) => {
    try {
        const userExists = await User.findOne({ email: req.query.email })
        if (userExists) {
            res.status(200).send({ message: "email already registered", success: false })
        } else {
            const otp = Math.floor(Math.random() * 9000) + 1000;
            sMail(req.query.email, otp)
            setOTP(req.query.email, otp);
            res.status(200).send({success: true, message: "otp sented successfully" })
        }
    } catch (error) {
        console.log(error.message);
        res.status(401).send({ message: "something went wrong", success: false })
    }
}

const checkIfUser =async(req,res)=>{
    try {
        console.log("user reached for checking user");
    const tokenWithBearer= req.headers['authorization']
    console.log(tokenWithBearer,";;;;;");
    const token=tokenWithBearer.split(" ")[1]
    console.log(token,'JJJJJJ');
    jwt.verify(token,process.env.JWT_SECRET_KEY,(err,encoded)=>{
        if(err){
            console.log("wrong");
            return res.status(401).send({message:"Auth failed",success:false})
        }else{
            const data ={
                username:`${userData.fname} ${userData.lname}`,
                token:token
            }
            res.status(200).send({message:"Auth successfull",success:true,data})
        }
    })
    } catch (error) {
        console.log(error.message);
        
    }
}

const userProfile=async(req,res)=>{
   try {
    const userId = req.id
    const userDetails=await User.findOne({_id:userId})


    res.status(200).send({success:true,message:"data fetched successfully",data:userDetails})
   } catch (error) {
    res.status(401).send({success:false,message:"something went wrong"})
   }
}

const editUserProfile =async(req,res)=>{
    try {
    const {fname,lname,mobile}=req.body
    const userDetails =await User.findOne({_id:req.id})
    if(req.file){
        const result = await cloudinary.uploader.upload(req.file.path,{folder:"userProfile"})
        userDetails.image=result.secure_url
    }
    userDetails.fname=fname
    userDetails.lname=lname
    userDetails.mobile=mobile

    await userDetails.save()

    console.log(userDetails,"updated details");
    res.status(200).send({success:true,message:"profile updated successfully",data:userDetails})

    } catch (error) {
        res.status(401).send({success:false,message:"something went wrong"})
        
    }


}

const uploadToCloudinary = async (fileBuffer) => {
    try {
      const result = await cloudinary.uploader.upload(fileBuffer,{folder:"userIdProof"});
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw error;
    }
  };

const acceptProof =async(req,res)=>{
    try {
        const userDetails =await User.findOne({_id:req.id})
        const { licenseFrontSide, licenseBackSide } = req.files;
        const licenseFrontSideImageUrl = await uploadToCloudinary(licenseFrontSide[0].path);
        const licenseBackSideImageUrl = await uploadToCloudinary(licenseBackSide[0].path);
        userDetails.licenseFrontSide=licenseFrontSideImageUrl
        userDetails.licenseBackSide=licenseBackSideImageUrl
        await userDetails.save()
        res.status(200).send({success:true,message:"proof updated successfully",data:userDetails})
    } catch (error) {
        res.status(400).send({success:false,message:'something went wrong'})    
    }
}


const findCities = async(req,res)=>{
    try {
        const cities = await Partner.distinct('city').exec();
       
            res.status(200).send({success:true,message:"cities featched",data:cities})
        
    } catch (error) {
        res.status(401).send({success:false,message:"something went wrong"})    
    }
}




const getBikes = async (req, res) => {
    try {
        console.log("reached user getBikes")
        console.log(req.query);

        const page = parseInt(req.query.page) || 1;
        const sort = req.query.sort || 'default';
        const filterCat = req.query.category || '';
        const search = req.query.search || '';

        const limit = 8;
        const skip = (page - 1) * limit;

        let query = {};
        if (filterCat) {
            query.category = filterCat;
        }
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        let sortOptions = {};
        if (sort === 'lowToHigh') {
            sortOptions.rentPerHour = 1;
        } else if (sort === 'highToLow') {
            sortOptions.rentPerHour = -1;
        }

        const totalItems = await Bike.countDocuments(query);
        const totalPages = Math.ceil(totalItems / limit);

        const bikes = await Bike.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);

        const datas = {
            bikes,
            totalPages,
            page
        }

        res.status(200).send({ message: "data fetched successfully", success: true, data: datas })

    } catch (error) {
        console.log(error);

    }
}





const getBikes2 = async (req, res) => {
    try {
        console.log("reached user getBikes");
        console.log(req.query);

        const page = parseInt(req.query.page) || 1;
        const sort = req.query.sort || 'default';
        const filterCat = req.query.category || '';
        const search = req.query.search || '';
        const city = req.query.city || '';
        const pickUpDate = req.query.pickUpDate || '';
        const pickUpTime = req.query.pickUpTime || '';
        const dropDate = req.query.dropDate || '';
        const dropTime = req.query.dropTime || '';

        const limit = 8;
        const skip = (page - 1) * limit;

        let query = {};

        if (filterCat) {
            query.category = filterCat;
        }
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        let sortOptions = {};

        if (sort === 'lowToHigh') {
            sortOptions.rentPerHour = 1;
        } else if (sort === 'highToLow') {
            sortOptions.rentPerHour = -1;
        }

        // New filter criteria for availability
        if (city && pickUpDate && pickUpTime && dropDate && dropTime) {
            // Find partners in the specified city
            const partnersInCity = await Partner.find({ city });

          

            // Get partner IDs in the city
            const partnerIds = partnersInCity.map(partner => partner._id);
            console.log(partnerIds,"idddds");

            // Check for overlapping bookings
            const overlappingBookings = await Booking.find({
                partner: { $in: partnerIds },
                bike: { $ne: null }, // Exclude bookings with no bike assigned
                $or: [
                    {
                        $and: [
                            { pickUpDate: { $lte: dropDate } },
                            { dropDate: { $gte: pickUpDate } },
                            {
                                $or: [
                                    { $and: [{ pickUpTime: { $lte: dropTime } }, { dropTime: { $gte: pickUpTime } }] },
                                    { $and: [{ pickUpTime: { $lte: dropTime } }, { dropTime: { $gte: pickUpTime } }] },
                                    { $and: [{ pickUpTime: { $gte: pickUpTime } }, { dropTime: { $lte: dropTime } }] },
                                ],
                            },
                        ],
                    },
                ],
            });

            console.log(overlappingBookings,"orderderdsss");

            // Filter out bikes that have overlapping bookings
            const bookedBikeIds = overlappingBookings.map(booking => booking.bike);
            query._id = { $nin: bookedBikeIds };
        }

        console.log(query,"jbdskjbvfvkfbvkhds");

        const totalItems = await Bike.countDocuments(query);
        const totalPages = Math.ceil(totalItems / limit);

        const bikes = await Bike.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);

        const datas = {
            bikes,
            totalPages,
            page,
        };
        console.log(bikes);

        res.status(200).send({ message: "data fetched successfully", success: true, data: datas });

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal server error", success: false });
    }
}


const getBookings =async(req,res)=>{
    try {
        
        const rides = await Booking.find({ user: req.id }).populate('bike');
        console.log(rides);

        res.status(200).send({success:true,message:"data featched successfully",data:rides})
    } catch (error) {
        console.log(error.message);
        res.status(401).send({success:false,message:"something went wrong"})  
    }
}

const cancelRide =async(req,res)=>{
    try {
        console.log(req.body);
        const ride = await Booking.findOne({ _id: req.body.order })
        ride.status="cancelled"
        await ride.save()
        console.log(ride);
        res.status(200).send({success:true,message:"ride cancelled"})
    } catch (error) {
        console.log(error.message);
        res.status(401).send({success:false,message:"something went wrong"})  
    }
}

module.exports = {
    verifyOTP,
    verifyLogin,
    getBikes,
    checkEmail,
    checkIfUser,
    userProfile,
    editUserProfile,
    acceptProof,
    findCities,
    getBikes2,
    getBookings,
    cancelRide
};
