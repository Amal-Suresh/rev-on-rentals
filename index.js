const express=require('express')
const mongoose=require('mongoose')
const cors =require('cors')
const path = require('path')
const color= require('colors')
require('dotenv').config()
const { Server } = require('socket.io');
const http = require('http');
const Chat = require('./models/chatModel')

//connect to mongoDB
mongoose.connect(process.env.DATABASE).then(()=>{
    console.log("DB connected".red.bold);
})

//initialize Express app
const app = express()
app.use(express.urlencoded({extended:false}))
app.use(express.json())

app.use(cors({
  // origin: 'http://localhost:3000',
   origin: 'https://rev-on-rentals.vercel.app',  
  methods: ['GET', 'POST','PUT','PATCH','DELETE'], // Allow specific HTTP methods
  credentials: true, // Allow cookies and authentication headers
}));

app.use('/',require('./routes/user'))
app.use('/admin',require('./routes/admin'))
app.use('/partner',require('./routes/partner'))

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
   origin: 'https://rev-on-rentals.vercel.app',  
    // origin: 'http://localhost:3000',
    methods: ["GET", "POST", "PATCH"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  socket.on('send_message', async (data) => {
    try {
      // Save the message to the database
      const time = new Date().getHours() + ':' + new Date().getMinutes();
      const chatData = new Chat({
        user:data.user,
        sender:data.sender,
        text:data.text,
        createdAt:new Date(),
        time
      });
      await chatData.save();
      // Emit the message to all connected users
      io.emit('receive_message', chatData);
    } catch (err) {
      console.log("err", err.message)
    }
  });

  socket.on("disconnect", () => {

  });
})


//start server
const PORT=5000;
server.listen(PORT,()=>{
    console.log("server connected".blue.bold);

})