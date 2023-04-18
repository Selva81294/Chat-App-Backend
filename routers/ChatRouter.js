import express from "express"
import Chat from "../models/chatModel.js";
import { User } from "../models/userModel.js";

const chatRouter = express.Router();


// API for 1 on 1 Chat
chatRouter.post("/", async (req,res)=>{
        const {userId} = req.body;
        if(!userId)  return res.status(400).json({message: "UserId param not sent with request"});

        let isChat = await Chat.find({
            isGroupChat: false,
            $and: [
                {users: {$elemMatch: {$eq: req.user._id}}},
                {users: {$elemMatch: {$eq: userId}}}
            ],
        }).populate("users","-password").populate("latestMessage")

        isChat = await User.populate(isChat, {
            path: "latestMessage.sender",
            select: "name pic email"
        })

        if(isChat.length > 0) {
            res.send(isChat[0])
        } else{
            let chatData = {
                chatName: "sender",
                isGroupChat: false,
                users: [req.user._id, userId]
            }
            try {
                const createdChat = await Chat.create(chatData);
                
                const fullChat = await Chat.findOne({_id: createdChat._id}).populate("users","-password")

                res.status(200).send(fullChat)
            } catch (error) {
                console.log(error)
                res.status(500).json({message: "Internal Server Error"})
            }
        }
})

//API for fetching all chats
chatRouter.get("/", async (req,res)=>{
    try {
         Chat.find({users: {$elemMatch: {$eq: req.user._id}}})
         .populate("users", "-password")
         .populate("groupAdmin", "-password")
         .populate("latestMessage")
         .sort({updatedAt: -1})
         .then(async (results)=>{
            results =  await User.populate(results, {
                path: "latestMessage.sender",
                select: "name pic email"
            })

            res.status(200).send(results)
         })
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Internal Server Error"})
    }
})


//API for group chats
chatRouter.post("/group", async (req,res)=>{ 
    if(!req.body.users || !req.body.name){
        return res.status(400).json({message: "Please fill all the fields"});
    }

     var users = JSON.parse(req.body.users)

    if(users.length < 2){
        return res.status(400).json({message: "Minimum 2 users required to create group"});
    }

    users.push(req.user);

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            isGroupChat: true,
            users: users,
            groupAdmin: req.user
        });

        const fullGroupChat = await Chat.findOne({_id: groupChat._id})
        .populate("users","-password").populate("groupAdmin", "-password")

        res.status(200).json(fullGroupChat)

    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Internal Server Error"})
    }
})

//APi for Group renaming
chatRouter.put("/rename", async (req,res)=>{
    const {chatId, chatName} = req.body;

    const updateChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName,
        },
        {
            new: true,
        }
    ).populate("users", "-password").populate("groupAdmin", "-password")

    if (!updateChat){
        return res.status(400).json({message: "Chat Not Found"});
    } else{
        res.status(200).send(updateChat)
    }
})

//API for add user to group 
chatRouter.put("/groupadd", async (req,res)=>{
    const {chatId, userId} = req.body;

    const added = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: {users: userId},
        },
        {
            new: true
        }
    ).populate("users","-password").populate("groupAdmin","-password");

    if (!added){
        return res.status(400).json({message: "Chat Not Found"});
    } else{
        res.status(200).send(added)
    }
})

//API for renove user from group
chatRouter.put("/groupremove", async (req,res)=>{
    const {chatId, userId} = req.body;
    const removed = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: {users: userId},
        },
        {
            new: true
        }
    ).populate("users","-password").populate("groupAdmin","-password");

    if (!removed){
        return res.status(400).json({message: "Chat Not Found"});
    } else{
        res.status(200).send(removed)
    }
})


export default chatRouter;