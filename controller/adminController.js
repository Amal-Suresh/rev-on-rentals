const Partner = require('../models/partnerModel')
const User = require('../models/userModel')
const nodemailer = require('nodemailer')
const Admin = require('../models/adminModel')
const jwt = require('jsonwebtoken')
const Chat =require('../models/chatModel')
const Booking = require('../models/bookingModel')


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
        html: `
        <html>
        <head>
          <style>
            body {
              background-color: yellow;
              color: black;
              font-family: Arial, sans-serif;
            }
            .container {
              background-color: white;
              border-radius: 10px;
              padding: 20px;
              margin: 20px auto;
              max-width: 600px;
            }
            h1 {
              color: black;
            }
            p {
              color: black;
              font-size: 18px;
            }
            .btn {
              display: inline-block;
              padding: 10px 20px;
              background-color: black;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Partner Verification for rev-on Rental</h1>
            <p>To complete your partner verification and enjoy the benefits of being a verified partner, please follow these steps:</p>
            <ol>
              <li>Log on to the website.</li>
              <li>Update your profile.</li>
              <li>Click the link below to log in to the partner dashboard.</li>
            </ol>
            <a href="https://rev-on-rentals.vercel.app/partner/login" class="btn">Log in to Partner Dashboard</a>
          </div>
        </body>
        </html>
      `
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



const loadPartnerRequests = async (req, res) => {
    try {
        console.log("reached partner requests");
        const partnerReqs = await Partner.find({isVerifed: { $in: ["notVerified", "mailSented"]} })
        console.log(partnerReqs, "partner date");
        if (partnerReqs) {
            res.status(200).send({ message: "requests featched successfully", success: true, data: partnerReqs })
        } else {
            res.status(200).send({ message: "no partner requests found", success: false, nodata: true })
        }
    } catch (error) {
        res.status(401).send({ message: "something went wrong", success: false })

    }
}

const changePartnerStatus = async (req, res) => {
    try {
        const PartnerData = await Partner.findOne({ _id: req.query.id })
        PartnerData.status = !PartnerData.status
        await PartnerData.save()
        res.status(200).send({ success: true, message: "status changed successfully", updatedrequest: PartnerData })
    } catch (error) {
        res.status(401).send({ success: false, message: "something went wrong" })
    }
}

const loadUsers = async (req, res) => {
    try {
        console.log("kkkkkkk");
        const userData = await User.find()
        if (userData) {
            res.status(200).send({ success: true, message: "feached data", user: userData })
        }
    } catch (error) {
        res.status(401).send({ success: false, message: "Something went wrong" })
    }
}

const changeUserStatus = async (req, res) => {
    try {
        console.log("reached change status");
        console.log(req.query.id);
        const userData = await User.findOne({ _id: req.query.id })
        userData.status = !userData.status
        await userData.save()
        res.status(200).send({ success: true, message: "status changed successfully", updatedUser: userData })
    } catch (error) {
        res.status(401).send({ success: false, message: "Something went wrong" })
    }
}

const rejectRequest = async (req, res) => {
    try {
        console.log("reached reject request");
        console.log(req.query.email);
        sMail(req.query.email)
        const removePartnerReq = await Partner.deleteOne({ email: req.query.email })
        if (removePartnerReq) {
            res.status(200).send({ success: true, message: "request rejected" })
        } else {
            res.status(200).send({ success: false, message: "failed to reject request" })
        }
    } catch (error) {
        res.status(401).send({ success: false, message: "something went wrong" })
    }
}

const sendMailtoPartner = async (req, res) => {
    try {
        sendMail(req.query.email)
        const partnerData = await Partner.findOne({email:req.query.email})
        partnerData.isVerifed="mailSented"
        await partnerData.save()
        const partnerReqs = await Partner.find({ isVerifed: { $in: ["notVerified", "mailSented"] }})
        res.status(200).send({ success: true, message: "message sented",data:partnerReqs })
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ success: false, message: "Something went wrong" })

    }
}


const verifyPartner = async (req, res) => {
    try {
        console.log(req.query.email);
        const changeStatus = await Partner.findOne({ email: req.query.email })
        if( changeStatus.isVerifed === "verified"){
            changeStatus.isVerifed = "notVerified"
        }else{
            changeStatus.isVerifed = "verified"
        }
        await changeStatus.save()
        res.status(200).send({ success: true, message: "Partner Verified" })
    } catch (error) {
        res.status(401).send({ success: false, message: "something went wrong" })
    }
}




const loadVerifiedPartners = async (req, res) => {
    try {
        console.log("reached partner requests");
        const partnerReqs = await Partner.find({ isVerifed:"verified" })
        console.log(partnerReqs, "partner date");
        if (partnerReqs) {
            res.status(200).send({ message: "requests featched successfully", success: true, data: partnerReqs })
        } else {
            res.status(200).send({ message: "no partner requests found", success: false, nodata: true })
        }
    } catch (error) {
        res.status(401).send({ message: "something went wrong", success: false })

    }
}

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        const adminData = await Admin.findOne({ email: email })
        if (adminData) {
            if (adminData.password === password) {
                const token = jwt.sign({ id: adminData._id, role: "admin", username: `${adminData.fname} ${adminData.lname}` }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' })
                const adminDetails = {
                    name: `${adminData.fname} ${adminData.lname}`,
                    token: token
                }
                res.status(200).send({ success: true, message: "login successfull", data: adminDetails })
            } else {
                res.status(200).send({ success: false, message: "invalid username or password" })
            }
        } else {
            res.status(200).send({ success: false, message: "invalid username or password" })
        }
    } catch (error) {
        console.log(error.message);
        res.status(401).send({ success: false, message: "something went wrong" })
    }
}

const fetchUser = async (req, res) => {
    try {
        const userChats = await Chat.aggregate([
          
            {
                $group: {
                    _id: '$user',
                    latestMessage: { $max: '$createdAt' }, // Find the latest message for each user
                    text: { $last: '$text' },
                    time: { $last: '$time' } // Get the text of the latest message
                }
            },
            {
                $lookup: {
                    from: 'users', // This should match the name of your User collection in MongoDB
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $project: {
                    _id: 1,
                    latestMessage: 1,
                    text: 1, 
                    time:1,
                    userDetails: { $arrayElemAt: ['$userDetails', 0] }
                }
            }
        ]);

        res.status(200).send({success:true,message:"data fetched successfully",data:userChats})
    } catch (error) {
        console.log(error.message);
    }
}

const fetchIndividualChat=async(req,res)=>{
    try {
        console.log("reached lkognjnnnnnnnnnnnnnmnnnnnnnnnnnnnnnnnnnn");
        const messages = await Chat.find({
            'user': req.query.id // Messages received by or associated with the user
          })
          .sort({ createdAt: 1 }); 
          console.log(messages);

          if(messages){
            res.status(200).send({success:true,message:"something",data:messages})
          }
          
        
    } catch (error) {
        console.log(error.message);
        
    }
}

const replyToUser=async(req,res)=>{
    try {
        console.log("reached replay user",req.body);
        const {id,textToSent}=req.body


        const newChat=new Chat({
            user:id,
            text:textToSent,
            createdAt:new Date(),
            sender:"Admin"
        })

        await newChat.save()

        const messages = await Chat.find({
            'user':id // Messages received by or associated with the user
          })
          .sort({ createdAt: 1 }); 
          console.log(messages);


          res.status(200).send({success:true,message:"message sented successfully",data:messages})

    } catch (error) {
        
    }
}


const ckeckIdAdmin = async (req, res) => {
    try {
        const tokenWithBearer = req.headers['authorization'];
        const token = tokenWithBearer.split(" ")[1]
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, encoded) => {
            if (err) {
                return res.status(401).send({ message: "Auth failed", success: false })
            } else if (encoded.role === 'admin') {
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


const fetchBookingBikesRevenu = async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments({
            status: 'completed',
        });
        const totalPartners = await Partner.countDocuments();
        const totalUsers = await User.countDocuments();


        const result = await Booking.aggregate([
            {
                $match: {
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
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        const weekly = await Booking.aggregate([
            {
                $match: {
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
        const missingDays = daysOfWeek.filter(day => !weekly.some(item => item.dayName === day)).map(day => ({ dayName: day, count: 0 }));
        const combinedResults = [...weekly, ...missingDays];
        const customOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        combinedResults.sort((a, b) => customOrder.indexOf(a.dayName) - customOrder.indexOf(b.dayName));
        const basicDetailsForDash = {
            totalRevenu,
            totalBookingCount,
            totalUsers,
            totalPartners
        }
         res.status(200).json({ success: true, message: "data fetched for dashboard", data: basicDetailsForDash, currentWeek: combinedResults })
    } catch (error) {
        console.log(error.message);
         res.status(500).send({ success: false, message: "something went wrong" })


    }
}


const monthlySalesRatio = async (req, res) => {
    try {
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
    loadPartnerRequests,
    changePartnerStatus,
    loadUsers,
    changeUserStatus,
    rejectRequest,
    sendMailtoPartner,
    verifyPartner,
    loadVerifiedPartners,
    adminLogin,
    fetchUser,
    fetchIndividualChat,
    replyToUser,
    ckeckIdAdmin,
    fetchBookingBikesRevenu,
    monthlySalesRatio
}