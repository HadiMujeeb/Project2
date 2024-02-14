const express = require("express");
// const app=express()
const user_router = express();
const userController = require("../Controllers/userController");
const cartController = require("../Controllers/cartController");

const auth = require("../Middlewire/Auth");

//view engine setup

user_router.set("view engine", "ejs");
user_router.set("views", "./views/user");

user_router.get("/", auth.isLogout, userController.Homepage);

user_router.get("/home", auth.isLogin, auth.isBlock, userController.Homepage);

user_router.get("/register", auth.isLogout, userController.RegisterPage);

user_router.post("/register", userController.insertUser);

user_router.get("/verifyOTP", auth.isLogout, userController.loadOtpPage);

user_router.post("/verifyOTP", userController.verifyOtp);

user_router.post("/resendOtp", userController.resendOTP);

user_router.delete("/deleteExpiredOtps", userController.deleteExpiredOtps);

user_router.delete("/firstDelete", userController.deleteExpiredOtps);

user_router.get("/login", auth.isLogout, userController.LoginPage);

user_router.post("/login", userController.VerifyLogin);

user_router.get("/logout", userController.userLogout);

user_router.get("/shop", userController.loadShop);

user_router.get("/single", userController.SingleProduct);

user_router.get("/forget", userController.ForgetLoad);

user_router.post("/forget", userController.forgetpasswordVerify);

user_router.get("/forgetpassword", userController.ResetPasswordLoad);

user_router.post("/forgetpassword", userController.resetpassword);

user_router.get("/profile", auth.isLogin, userController.LoadProfile);

user_router.post("/EditProfile", userController.EditProfile);

// user_router.get("/resetProfile", userController.rest_pass_profile);



user_router.get("/addaddress", userController.LOADaddaddress);

user_router.post("/addaddress", userController.AddAddress);

user_router.delete("/deleteaddress", userController.DeleteAddress);

// user_router.post("/EditAddress",userController.DeleteAddress)

user_router.get("/editaddress", userController.LoadEditAddress);

user_router.post("/editaddress", userController.EditAddress);

user_router.get("/cart", cartController.loadCart);

user_router.post("/add-to-cart", cartController.AddToCart);

user_router.post("/quantityUpdate", cartController.UpdateQuantity);

user_router.post("/quantityUpdate", cartController.UpdateQuantity);

user_router.post("/deleteItems", cartController.deleteItems);

user_router.get("/checkout", cartController.LoadCheckout);

user_router.post("/CompleteCheckout",auth.stop, cartController.Checkout);

user_router.get("/addressCheckout", cartController. LoadCheckADDaddress);

user_router.post("/addressCheckout", cartController. CheckADDaddress);


user_router.get("/confirm", cartController.LoadConfirm);


user_router.get("/order", cartController.LoadOrder);

user_router.get("/orderview", cartController.OrderView);

user_router.get("/OrderCancel", cartController.OrderCancel);










module.exports = user_router;
