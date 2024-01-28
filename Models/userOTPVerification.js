const mongoose = require("mongoose");

const userOtpVerificationSchema = new mongoose.Schema({

email: String,

otp:Number,

createdAt:Date,

expiresAt:Date,

attempts: { type: Number, default: 0 }
});


module.exports = mongoose.model("userOtpVerificationSchema",userOtpVerificationSchema)


