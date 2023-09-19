const Partner = require('../models/partnerModel')
const User = require('../models/userModel')
const nodemailer = require('nodemailer')
const Admin = require('../models/adminModel')
const jwt = require('jsonwebtoken')



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
            <a href="http://localhost:3000/partner/login" class="btn">Log in to Partner Dashboard</a>
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
        const partnerReqs = await Partner.find({ isVerifed: false })
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
        res.status(200).send({ success: true, message: "message sented" })
    } catch (error) {
        res.status(401).send({ success: false, message: "Something went wrong" })

    }
}


const verifyPartner = async (req, res) => {
    try {
        console.log(req.query.email);
        const changeStatus = await Partner.findOne({ email: req.query.email })
        changeStatus.isVerifed = !changeStatus.isVerifed
        await changeStatus.save()
        res.status(200).send({ success: true, message: "Partner Verified" })
    } catch (error) {
        res.status(401).send({ success: false, message: "something went wrong" })
    }
}


const loadVerifiedPartners = async (req, res) => {
    try {
        console.log("reached partner requests");
        const partnerReqs = await Partner.find({ isVerifed: true })
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



module.exports = {
    loadPartnerRequests,
    changePartnerStatus,
    loadUsers,
    changeUserStatus,
    rejectRequest,
    sendMailtoPartner,
    verifyPartner,
    loadVerifiedPartners,
    adminLogin
}