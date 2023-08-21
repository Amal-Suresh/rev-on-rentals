const nodemailer = require('nodemailer')
const User = require('../models/userModel')
const Bike = require('../models/bikeModel')


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







const sendOtp = async (req,res) => {
    try {
        const otp = Math.floor(Math.random() * 9000) + 1000;
        sMail(req.body.email,otp)
        setOTP(req.body.email,otp);
        res.status(200).send({success:true,message:"otp sented successfully"})
    } catch (error) {
        res.status(401).send({success:false,message:"something went wrong"})   
    }
}

const verifyOTP = async (req, res) => {
    try {
        const { fname, lname, email, password, mobile } = req.body.data
        const result = getOTPAndDate(email);
        if (result) {
            if (result.otp == req.body.otp) {
                const userData = new User({
                    fname,
                    lname,
                    email,
                    mobile,
                    password
                })
                await userData.save()
                emailOTPDateMap.delete(email);
                res.status(200).send({ success:true, message: "successfully registered" })
            } else {
                res.status(200).send({ success:false, message: "Wrong Otp" })
            }
        } else {
            res.status(200).send({ success:false, message: "otp expired" })
        }
    } catch (error) {
        res.status(401).send({ success:false, message: "something went Wrong"})
    }
}

const verifyLogin =async(req,res)=>{
   try {
    console.log(req.body,"userdata login");

    const userData =await User.findOne({email:req.body.email})
    if(userData.password==req.body.password){

        res.status(200).send({success:true,message:"login successfull"})
    }else{
        res.status(200).send({success:false,message:"invalid username or password"})
    }
   } catch (error) {
    res.status(401).send({success:false,message:"something went wrong"})
    
   }
}

const getBikes = async(req,res)=>{
    try {
        console.log("reached user getBikes");
        // const page = parseInt(req.query.page)-1 || 0
        // const limit = parseInt(req.query.limit) || 5
        // const search = req.query.search || ""
        // const sort = req.query.sort || ""
        // let category = req.query.category || "All"

        const page = parseInt(req.query.page) || 1;
        const sort = req.query.sort || 'default';
        const filterCat = req.query.category || '';
        const search = req.query.search || '';
    
        const limit = 6; // Number of items per page
        const skip = (page - 1) * limit;
    
        let query = {};
    
        // Apply category filter
        if (filterCat) {
          query.category = filterCat;
        }
    
        // Apply search filter
        if (search) {
            query.name = { $regex: search, $options: 'i' };
          }
      
    
        let sortOptions = {};
    
        // Apply sorting
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

          console.log(bikes,"kkkkkk");
    
       const datas ={
          bikes,
          totalPages,
          page
        }

        res.status(200).send({message:"data fetched successfully",success:true, data:datas})

    } catch (error) {
        console.log(error);
        
    }

    


}


module.exports = {
    sendOtp,
    verifyOTP,
    verifyLogin,
    getBikes
};
