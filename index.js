const express=require('express')
const mongoose=require('mongoose')
const cors =require('cors')
const path = require('path')
const color= require('colors')
require('dotenv').config()



//connect to mongoDB
mongoose.connect("mongodb://127.0.0.1:27017/rev-on-rentals").then(()=>{
    console.log("DB connected".red.bold);
})

//initialize Express app

const app = express()
app.use(express.urlencoded({extended:false}))
app.use(express.json())

// app.use(cors({
//     origin:"http://localhost:3000/",
//     methods: ["GET", "POST"],
//   credentials: true,
//   allowedHeaders: ["Content-Type", "Access-Control-Allow-Headers"]
// }))
app.use(cors({
  origin: 'http://localhost:3000',  
  methods: ['GET', 'POST'], // Allow specific HTTP methods
  credentials: true, // Allow cookies and authentication headers
}));


app.use('/',require('./routes/user'))
app.use('/admin',require('./routes/admin'))
app.use('/partner',require('./routes/partner'))

//start server
const PORT=5000;
app.listen(PORT,()=>{
    console.log("server connected".blue.bold);

})
