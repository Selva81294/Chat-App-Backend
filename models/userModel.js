import mongoose from "mongoose"
import jwt from "jsonwebtoken"

const userModel = mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    pic: {type: String, default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"}
},
{
    timestamps: true,
})

export const generateAuthToken = (id) =>{
    return jwt.sign({id},process.env.SECERT_KEY)
}

export const User = mongoose.model("User", userModel)


