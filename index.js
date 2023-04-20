import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import {dataBaseConnection} from "./db.js"
import router from "./routers/index.js"
import { Server } from "socket.io";

dotenv.config()
const app = express()

//middlewares
app.use(cors())
app.use(express.json())

//create server
const server = app.listen(process.env.PORT, ()=>{
    console.log(`Server Started on PORT ${process.env.PORT}`)
})

////db connections
dataBaseConnection();

//api
app.use("/api",router)

//socket.io
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: "https://keen-sorbet-c69c44.netlify.app"
    }
});

io.on('connection', (socket)=>{
    console.log("connected to socket.io")

    socket.on("setup", (userData)=>{
        socket.join(userData._id)
        socket.emit("connected")
    });

    socket.on("join chat", (room)=>{
        socket.join(room)
        console.log("User Joined Room: " + room)
    })

    socket.on("typing", (room)=>socket.in(room).emit("typing"))
    socket.on("stop typing", (room)=>socket.in(room).emit("stop typing"))

    socket.on("new message", (newMessageReceived)=>{
        let chat = newMessageReceived.chat;
        if(!chat.users) return console.log("chat.users not defined")
        chat.users.forEach(user => {
            if(user._id == newMessageReceived.sender._id) return;
            socket.in(user._id).emit("message received", newMessageReceived)
        })
    })

    socket.off('setup', (userData)=>{
        console.log("User Disconnected")
        socket.leave(userData._id)
    })
})

