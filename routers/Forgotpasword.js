import express from "express"
import {User} from "../models/userModel.js"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"


const forgotPasswordRouter = express()


forgotPasswordRouter.set("view engine", "ejs");

forgotPasswordRouter.post("/", async (req, res) => {
  const { email } = req.body;
  try {
    const oldUser = await User.findOne({ email });

    if (!oldUser) {
      return res.status(400).json({ message: "User not exits" });
    }

    const secret = process.env.SECERT_KEY + oldUser.password;
    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, {
      expiresIn: "15m",
    });

    const link = `http://localhost:8000/api/resetpassword/${oldUser._id}/${token}`;
    
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "selva81294@gmail.com",
        pass: "ddxstkomrucdwkov",
      },
    });

    var mailOptions = {
      from: "selva81294@gmail.com",
      to: "kumaranselva888@gmail.com",
      subject: "Password Reset",
      text: link
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    // console.log(link)
    res.status(200).json({ message: "Link sent to your mail" });
  } catch (error) {
    console.log(error);
  }
});

export default forgotPasswordRouter;
