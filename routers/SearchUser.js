import express from "express"
import { User} from "../models/userModel.js"

const searchRouter = express.Router();

//get all users
searchRouter.get("/users", async (req,res)=>{
    try {
        const user = await User.find()
        if(!user) return res.status(400).json({message:"Could not fetch your data"}) 
        res.status(200).send(user)
    } catch (error) {
        console.log(error)
        res.status(500).send({message: "Internal Server Error"})
    }
})

//get all users by queries
searchRouter.get("/usersquery", async (req,res)=>{
    try {
        const keyword = req.query.search ? {
            $or: [
                {name: {$regex: req.query.search, $options: "i"}},
                {email: {$regex: req.query.search, $options: "i"}}
            ]
        }
        : {};

        const users = await User.find(keyword).find({_id: {$ne: req.user._id}})
        res.send(users)   
    } catch (error) {
        console.log(error)
        res.status(500).send({message: "Internal Server Error"})
    }
})

export default searchRouter;