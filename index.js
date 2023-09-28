const express=require('express')
const mongoose=require('mongoose')
const cors =require('cors')
const path = require('path')
const color= require('colors')
require('dotenv').config()

//connect to mongoDB
mongoose.connect(process.env.DATABASE).then(()=>{
    console.log("DB connected".red.bold);
})

//initialize Express app
const app = express()
app.use(express.urlencoded({extended:false}))
app.use(express.json())

app.use(cors({
  origin: 'https://rev-on-rentals.vercel.app/',  
  methods: ['GET', 'POST','PUT','PATCH','DELETE'], // Allow specific HTTP methods
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
