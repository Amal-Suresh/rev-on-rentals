const Partner = require('../models/partnerModel')
const Booking = require('../models/bookingModel')
const bcrypt = require('bcryptjs');
const cloudinary = require('../utils/cloudinery')
const jwt = require('jsonwebtoken')
const Bike = require('../models/bikeModel')
const nodemailer = require('nodemailer')


const hashPassword = (password) => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
}

const comparePassword = (plainPassword, hashed) => {
    verifyPassword = bcrypt.compareSync(plainPassword, hashed);
    return verifyPassword;
}

const receivePartner = async (req, res) => {
    try {
        const partnerExists = await Partner.findOne({ email: req.body.email })
        if (partnerExists) {
            return res.status(200).send({ message: "Email already exists", success: false })
        }
        const securedPassword = hashPassword(req.body.password)
        const partnerData = new Partner({
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            password: securedPassword
        })
        await partnerData.save()
        res.status(200).send({ message: "Registered successfully", success: true })

    } catch (error) {
        res.status(200).send({ message: "Something went wrong", success: false })
    }
}

const verifyLogin = async (req, res) => {
    try {
        const partnerData = await Partner.findOne({ email: req.body.email })
        if (partnerData) {
            if (partnerData.status) {
                const camparePass = comparePassword(req.body.password, partnerData.password)
                if (camparePass) {
                    const token = jwt.sign({ id: partnerData._id, role: "partner", username: `${partnerData.fname} ${partnerData.lname}` }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' })
                    const partnerDetails = {
                        username: `${partnerData.fname} ${partnerData.lname}`,
                        token: token
                    }
                    console.log("success");
                    res.status(200).send({ success: true, message: "login successfull", data: partnerDetails })
                } else {
                    res.status(200).send({ success: false, message: "invalid username or password" })
                }

            } else {
                res.status(200).send({ success: false, message: "you were blocked by admin" })
            }

        } else {
            res.status(200).send({ success: false, message: "invalid username or password" })
        }
    } catch (error) {
        console.log(error.message);
        res.status(401).send({ success: false, message: "something went wrong" })
    }
}

const addBikes = async (req, res) => {
    try {
        let bikeImages =req.files
      
        let images =[]
        for(let i=0;i<bikeImages.length;i++){
            const result = await cloudinary.uploader.upload(bikeImages[i].path, { folder: "bikeImages" })
            images.push( result.secure_url)

        }
        console.log(images);

      
        const { name, brand, category, engineCC, makeYear, rentPerHour, plateNumber } = req.body
        const bikeDetails = new Bike({
            name,
            brand,
            category,
            engineCC,
            makeYear,
            rentPerHour,
            plateNumber,
            image:images,
            partnerId: req.id
        })
        await bikeDetails.save()
        res.status(200).json({ success: true, message: "bike added successfully" })
    } catch (error) {
        console.log(error.message);
        res.status(401).send({ success: false, message: "something went wrong" })
    }
}


const viewBikes = async (req, res) => {
    try {
        const bikes = await Bike.find({ partnerId: req.id })
        res.status(200).send({ success: true, message: "data fetched successfully", data: bikes })
    } catch (error) {
        res.status(401).send({ success: false, message: "Something went wrong" })
    }
}

const changeStatus = async (req, res) => {
    try {
        const changeStat = await Bike.findOne({ _id: req.query.id })
        changeStat.status = !changeStat.status
        await changeStat.save()
        res.status(200).send({ success: true, message: "status updated successfully", updatedData: changeStat })
    } catch (error) {
        res.status(401).send({ success: false, message: "something went wrong" })
    }
}

//send otp to mail
const sMail = ((email, otp) => {
    console.log(otp, email, "dffjdjfdjfjdfjdj");
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
            console.log("done");
        } else {
            console.log('Email sent: ' + info.response);
            console.log("not done");

        }
    })
})



//create map for storing email and otp
const emailOTPForgetPass = new Map();

function setOTP(email, password, otp) {
    const currentDate = new Date();
    emailOTPForgetPass.set(email, { otp, password, date: currentDate });
}


function getOTPAndDate(email) {
    const entry = emailOTPForgetPass.get(email);
    if (entry) {
        const currentTime = new Date();
        const timeDifferenceInMilliseconds = currentTime - entry.date;
        const timeDifferenceInMinutes = timeDifferenceInMilliseconds / (1000 * 60);

        if (timeDifferenceInMinutes <= 5) {
            return { otp: entry.otp, date: entry.date };
        } else {
            emailOTPForgetPass.delete(email);
            return undefined;
        }
    } else {
        return undefined;
    }
}


const forgotPass = async (req, res) => {
    try {
        console.log("reached forgot pass");
        console.log(req.body);
        const otp = Math.floor(Math.random() * 9000) + 1000;
        console.log(otp);
        sMail(req.body.email, otp)
        setOTP(req.body.email, req.body.password, otp);
        res.status(200).send({ success: true, message: "otp sented successfully" })
    } catch (error) {
        res.status(401).send({ success: false, message: "something went wrong" })
    }
}

const verifyForgotOtp = async (req, res) => {
    try {
        console.log("reached verify forgot pass");
        const { email, password } = req.body.data
        const result = getOTPAndDate(email);
        if (result) {
            if (result.otp == req.body.otp) {
                let securedPassword=hashPassword(password)

                await Partner.updateOne({ email: email }, { $set: { password: securedPassword } });
                emailOTPForgetPass.delete(email);
                res.status(200).send({ success: true, message: "successfully password changed" })
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

const partnerProfile = async (req, res) => {
    try {
        const partnerId = req.id
        const partnerDetails = await Partner.findOne({ _id: partnerId })
        res.status(200).send({ success: true, message: "data fetched successfully", data: partnerDetails })
    } catch (error) {
        res.status(401).send({ success: false, message: "something went wrong" })
    }
}

const editPartnerProfile = async (req, res) => {
    try {
        const { fname, lname, mobile, city, gstNo } = req.body
        const partnerDetails = await Partner.findOne({ _id: req.id })
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, { folder: "partnerProfile" })
            partnerDetails.image = result.secure_url
        }
        partnerDetails.fname = fname
        partnerDetails.lname = lname
        partnerDetails.mobile = mobile
        partnerDetails.gstNo = gstNo
        partnerDetails.city = city
        await partnerDetails.save()
        res.status(200).send({ success: true, message: "profile updated successfully", data: partnerDetails })
    } catch (error) {
        res.status(401).send({ success: false, message: "something went wrong" })
    }
}

const uploadToCloudinary = async (fileBuffer) => {
    try {
        const result = await cloudinary.uploader.upload(fileBuffer, { folder: "partnerProof" });
        return result.secure_url;
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        throw error;
    }
};


const acceptProof = async (req, res) => {
    try {
        const partnerDetails = await Partner.findOne({ _id: req.id })
        const { aadhaar, pan } = req.files;
        const aadhaarImageUrl = await uploadToCloudinary(aadhaar[0].path);
        const panImageUrl = await uploadToCloudinary(pan[0].path);
        partnerDetails.aadhaar = aadhaarImageUrl
        partnerDetails.pan = panImageUrl
        await partnerDetails.save()
        console.log("done");
        res.status(200).send({ success: true, message: "proof updated successfully", data: partnerDetails })
    } catch (error) {
        res.status(400).send({ success: false, message: 'something went wrong' })
    }
}

const uploadLocationPoints = async (req, res) => {
    try {
        const partnerData = await Partner.findOne({ _id: req.id })
        if (!partnerData) {
            return res.status(200).send({ success: false, message: "something went wrong" })
        } else {
            partnerData.locations.push({ name: req.body.pointName })
            await partnerData.save()
            res.status(200).send({ success: true, message: "point added successfully", data: partnerData })
        }
    } catch (error) {
        res.status(401).send({ success: false, message: "something went wrong" })
    }
}

const checkIfPartner = async (req, res) => {
    try {
        const tokenWithBearer = req.headers['authorization'];
        const token = tokenWithBearer.split(" ")[1]
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, encoded) => {
            if (err) {
                return res.status(401).send({ message: "Auth failed", success: false })
            } else if (encoded.role === 'partner') {
                let partner = {
                    token: token,
                    username: encoded.username
                }
                res.status(200).send({ success: true, message: "Auth success", data: partner })
            }
        })

    } catch (error) {
        console.log(error.message);
        res.status(401).send({ message: "some thing went wrong", success: false })


    }
}

const findBookings = async (req, res) => {
    try {
        console.log(req.id, "lllll");
        const rides = await Booking.find({ partner: req.id }).populate('bike').populate('user');
        console.log(rides);

        res.status(200).send({ success: true, message: "data featched successfully", data: rides })
    } catch (error) {
        console.log(error.message);
        res.status(401).send({ success: false, message: "something went wrong" })
    }
}

const resendOtp = async (req, res) => {
    try {
        const email = req.body.email
        if (emailOTPForgetPass.has(email)) {
            const newOTP = Math.floor(Math.random() * 9000) + 1000;
            const currentData = emailOTPForgetPass.get(email);
            currentData.otp = newOTP;
            currentData.date = new Date()
            emailOTPForgetPass.set(email, currentData);
            sMail(email,newOTP)
            res.status(200).send({success:true,message:"otp resended successfully"})
        } else {
            res.status(201).send({success:false,message:"timeout"})
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send({success:false,message:"something went wrong"})
    }
}


module.exports = {
    receivePartner,
    verifyLogin,
    addBikes,
    viewBikes,
    changeStatus,
    forgotPass,
    verifyForgotOtp,
    partnerProfile,
    editPartnerProfile,
    acceptProof,
    uploadLocationPoints,
    findBookings,
    resendOtp
}