const Partner = require('../models/partnerModel')
const Booking = require('../models/bookingModel')
const bcrypt = require('bcryptjs');
const cloudinary = require('../utils/cloudinery')
const jwt = require('jsonwebtoken')
const Bike = require('../models/bikeModel')
const nodemailer = require('nodemailer')
const mongoose = require('mongoose')


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
        let bikeImages = req.files

        let images = []
        for (let i = 0; i < bikeImages.length; i++) {
            const result = await cloudinary.uploader.upload(bikeImages[i].path, { folder: "bikeImages" })
            images.push(result.secure_url)

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
            image: images,
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
        const page = parseInt(req.query.page)
        const limit = 6;
        const skip = (page - 1) * limit;
        const totalItems = await Bike.countDocuments();
        const totalPages = Math.ceil(totalItems / limit);
        const bikes = await Bike.find({ partnerId: req.id }).skip(skip).limit(limit);
        const details = {
            bikes,
            page,
            totalPages
        }
        res.status(200).send({ success: true, message: "data fetched successfully", data: details })
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
                let securedPassword = hashPassword(password)

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
            sMail(email, newOTP)
            res.status(200).send({ success: true, message: "otp resended successfully" })
        } else {
            res.status(201).send({ success: false, message: "timeout" })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ success: false, message: "something went wrong" })
    }
}


const checkIfPartner = async (req, res) => {
    try {
        console.log("check if partner reached");
        const tokenWithBearer = req.headers['authorization'];
        const token = tokenWithBearer.split(" ")[1]
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, encoded) => {
            if (err) {
                return res.status(401).send({ message: "Auth failed", success: false })
            } else if (encoded.role === 'partner') {
                console.log(encoded);
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

const deleteBike = async (req, res) => {
    try {
        const id = req.query.id
        const currentDate = new Date()
        const checkBike = await Booking.find({
            bike: id,
            pickUpDate: { $gte: currentDate }
        })
        if (checkBike.length > 0) {
            return res.status(201).send({ success: false, message: "bike is already in booking" })
        } else {
            const deleteBike = await Bike.findOneAndDelete({ _id: id })
            if (deleteBike) {
                res.status(200).send({ success: true, message: "bike deleted successfully" })
            } else {
                res.status(203).send({ success: false, message: "bike deletion failed" })
            }
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ success: false, message: "something went wrong" })
    }
}

const fetchBookingBikesRevenu = async (req, res) => {
    try {
        const bikeHided = await Bike.countDocuments({
            status: false,
            partnerId: req.id
        });
        const allBikesCount = await Bike.countDocuments({
            partnerId: req.id
        });
        const ObjectId = mongoose.Types.ObjectId;
        const partnerId = new ObjectId(req.id);
        const result = await Booking.aggregate([
            {
                $match: {
                    partner: partnerId,
                    status: "completed"
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    grandTotal: { $sum: "$grandTotal" }
                }
            }
        ]);

        let totalBookingCount = result[0].count
        let totalRevenu = result[0].grandTotal

        const currentDate = new Date();
        const currentDayOfWeek = currentDate.getDay();

        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDayOfWeek);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        // const weekly = await Booking.aggregate([
        //     {
        //         $match: {
        //             partner: partnerId,
        //             // status: "completed",
        //             date: {
        //                 $gte: startOfWeek,
        //                 $lte: endOfWeek,
        //             },
        //         },
        //     },
        //     {
        //         $group: {
        //             _id: { $dayOfWeek: "$date" },
        //             count: { $sum: 1 },
        //         },
        //     },
        //     {
        //         $sort: {
        //             _id: 1, // Sort by day of the week (1 = Sunday, 2 = Monday, ..., 7 = Saturday).
        //         },
        //     },
        // ])

        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        const weekly = await Booking.aggregate([
            {
                $match: {
                    partner: partnerId,
                    date: {
                        $gte: startOfWeek,
                        $lte: endOfWeek,
                    },
                },
            },
            {
                $group: {
                    _id: {
                        dayOfWeek: { $dayOfWeek: "$date" },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: {
                    "_id.dayOfWeek": 1, // Sort by day of the week (1 = Sunday, 2 = Monday, ..., 7 = Saturday).
                },
            },
            {
                $project: {
                    _id: 0, // Exclude the default MongoDB _id field.
                    dayOfWeek: "$_id.dayOfWeek",
                    count: 1,
                },
            },
            {
                $group: {
                    _id: null,
                    daysOfWeek: {
                        $push: {
                            dayOfWeek: "$dayOfWeek",
                            count: "$count",
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    daysOfWeek: 1,
                },
            },
            {
                $unwind: "$daysOfWeek",
            },
            {
                $project: {
                    _id: 0,
                    day: "$daysOfWeek.dayOfWeek",
                    count: {
                        $cond: {
                            if: { $eq: ["$daysOfWeek.count", null] },
                            then: 0,
                            else: "$daysOfWeek.count",
                        },
                    },
                },
            },
            {
                $sort: {
                    day: 1,
                },
            },
            {
                $project: {
                    dayName: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$day", 1] }, then: "Sunday" },
                                { case: { $eq: ["$day", 2] }, then: "Monday" },
                                { case: { $eq: ["$day", 3] }, then: "Tuesday" },
                                { case: { $eq: ["$day", 4] }, then: "Wednesday" },
                                { case: { $eq: ["$day", 5] }, then: "Thursday" },
                                { case: { $eq: ["$day", 6] }, then: "Friday" },
                                { case: { $eq: ["$day", 7] }, then: "Saturday" },
                            ],
                            default: "Unknown", // Default value if the day of the week is not recognized.
                        },
                    },
                    count: 1,
                },
            },
            {
                $group: {
                    _id: "$dayName",
                    count: { $first: "$count" },
                },
            },
            {
                $project: {
                    _id: 0,
                    dayName: "$_id",
                    count: 1,
                },
            },
        ]);

        // Create an array for missing days with count 0
        const missingDays = daysOfWeek.filter(day => !weekly.some(item => item.dayName === day)).map(day => ({ dayName: day, count: 0 }));

        // Combine the missing days with the actual results
        const combinedResults = [...weekly, ...missingDays];

        const customOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        combinedResults.sort((a, b) => customOrder.indexOf(a.dayName) - customOrder.indexOf(b.dayName));

        const basicDetailsForDash = {
            totalRevenu,
            totalBookingCount,
            allBikesCount,
            bikeHided
        }
        res.status(200).json({ success: true, message: "data fetched for dashboard", data: basicDetailsForDash, currentWeek: combinedResults })

    } catch (error) {
        console.log(error.message);
        res.status(500).send({ success: false, message: "something went wrong" })


    }
}

const monthlySalesRatio = async (req, res) => {
    try {
        const ObjectId = mongoose.Types.ObjectId;
        const partnerId = new ObjectId(req.id);
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        const cancelledBookings = await Booking.aggregate([
            {
                $match: {
                    $expr: {
                        $and: [
                            { $eq: [{ $year: "$date" }, currentYear] },
                            { $eq: [{ $month: "$date" }, currentMonth] },
                            { $eq: ["$status", "cancelled"] },
                            { $eq: ["$partner", partnerId] },
                        ],
                    },
                },
            },
            {
                $count: "cancelledCount",
            },
        ])

        const completedBookings = await Booking.aggregate([
            {
                $match: {
                    $expr: {
                        $and: [
                            { $eq: [{ $year: "$date" }, currentYear] },
                            { $eq: [{ $month: "$date" }, currentMonth] },
                            { $eq: ["$status", "completed"] },
                            { $eq: ["$partner", partnerId] },
                        ],
                    },
                },
            },
            {
                $count: "completedCount",
            },
        ])

        const count = {
            cancelled: cancelledBookings[0].cancelledCount,
            completed: completedBookings[0].completedCount
        }

        res.status(200).send({ success: true, message: "data fetched for monthly cancel & completed ratio", data: count })


    } catch (error) {
        console.log(error.message);
        res.status(500).send({ success: false, message: "something went wrong" })


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
    resendOtp,
    checkIfPartner,
    deleteBike,
    fetchBookingBikesRevenu,
    monthlySalesRatio
}