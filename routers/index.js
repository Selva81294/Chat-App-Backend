import express from "express"
const router = express.Router()
import isSignedIn from "../Controllers/auth.js"
import loginRouter from "./LoginUser.js"
import signupRouter from "./SignupRouter.js"
import forgotpasswordRouter from "./Forgotpasword.js"
import resetpasswordRouter from "./Resetpassword.js"
import searchRouter from "./SearchUser.js"
import chatRouter from "./ChatRouter.js"
import messageRouter from "./MessageRouter.js"

router.get("/",(req,res)=>{
    res.send("Welcome to fun chat application")
})

//Authorization Routers
router.use('/login', loginRouter)
router.use('/signup', signupRouter)
router.use('/forgotpassword', forgotpasswordRouter)
router.use('/resetpassword', resetpasswordRouter)

//User Router
router.use('/', isSignedIn, searchRouter)

//Chat Routers
router.use('/chat', isSignedIn, chatRouter)

//Message Routers
router.use('/message', isSignedIn, messageRouter)

export default router
