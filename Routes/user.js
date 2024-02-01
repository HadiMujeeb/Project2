const express =require("express");
// const app=express()
const user_router =express()
const userController=require("../Controllers/userController")
const auth = require('../Middlewire/Auth')



//view engine setup

user_router.set('view engine','ejs');
user_router.set('views','./views/user');

user_router.use(express.json());
user_router.use(express.urlencoded({extended:true}))
// const session = require("express-session");
// user_route.use(session({secret:config.sessionSecret,saveUninitialized:false,resave:false}))





user_router.get("/",auth.isLogout,userController.Homepage);

user_router.get('/home',auth.isLogin,auth.isBlock,userController.Homepage) 

user_router.get("/register",auth.isLogout,userController.RegisterPage);

user_router.post("/register",userController.insertUser);

user_router.get('/verifyOTP',auth.isLogout,userController.loadOtpPage)

user_router.post('/verifyOTP',userController.verifyOtp)

user_router.post('/resendOtp',userController.resendOTP)



user_router.get('/login',auth.isLogout,userController.LoginPage)

user_router.post('/login',userController.VerifyLogin)

user_router.get('/logout',userController.userLogout)

user_router.get('/shop',userController.loadShop)


user_router.get('/single',userController.SingleProduct)


user_router.get("/forget",userController.ForgetLoad)

user_router.post("/forget",userController.forgetpasswordVerify)

user_router.get("/forgetpassword",userController. ResetPasswordLoad )

user_router.post("/forgetpassword",userController. resetpassword)

user_router.get("/profile",auth.isLogin,userController.LoadProfile)

user_router.post("/EditProfile",userController.EditProfile)

user_router.get("/addaddress",userController.LOADaddaddress)


user_router.post("/addaddress",userController.AddAddress)

user_router.delete("/deleteaddress",userController.DeleteAddress)


user_router.post("/EditAddress",userController.DeleteAddress)









module.exports = user_router;