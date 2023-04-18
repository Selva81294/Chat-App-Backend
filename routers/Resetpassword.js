import express from "express"
import jwt from "jsonwebtoken"
import {User} from "../models/userModel.js"
import bcrypt from "bcrypt"


const resetpasswordRouter = express()
resetpasswordRouter.set("view engine","ejs")
resetpasswordRouter.use(express.urlencoded({extended:false}))


resetpasswordRouter.get('/:id/:token', async (req,res)=>{
    const {id,token} = req.params; 
    console.log(req.params)
    const oldUser = await User.findOne({_id:id})
    if(!oldUser){
        return res.status(400).json({message: "User not exists"}) 
    } 
    const secret = process.env.SECERT_KEY + oldUser.password;
    try {
        const verify = jwt.verify(token, secret)
        res.render("../routers/passwordChange",{email: verify.email,message: "Not updated"})
    } catch (error) {
        console.log(error)
        res.status(400).json({message: "Not verified"})
    }
})

resetpasswordRouter.post('/:id/:token', async (req,res)=>{
    const {id,token} = req.params;
    const {password, confirmpassword} = req.body;
    const oldUser = await User.findOne({_id:id})
    if(!oldUser){
        return res.status(400).json({message: "User not exists"})
    }
    const secret = process.env.SECERT_KEY + oldUser.password;
    try {
        const verify = jwt.verify(token, secret)
        const encryptedPassword = await bcrypt.hash(password,10)
        if(password !== confirmpassword){
            return res.status(400).json({message: "Password mismatch"})   
        }
        else{
            await User.updateOne(
                {
                    _id:id,
                },
                {
                    $set: {
                        password: encryptedPassword,
                    }
                }
            )
           res.render("../routers/passwordChange",{email: verify.email, message: "updated"})
        }
        
    } catch (error) {
        console.log(error)
        res.status(400).json({message: "Not verified"})
    }
})

export default resetpasswordRouter;