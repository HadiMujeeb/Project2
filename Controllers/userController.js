const User = require("../Models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const UserOTPVerification = require("../Models/userOTPVerification");
const Product = require("../Models/productModel");
const Categories = require("../Models/categoriesModel");
// password hide

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const RegisterPage = async (req, res) => {
  try {
    const messages = req.flash("message");
    res.render("registration", { messages });
  } catch (error) {
    console.log(error.message);
  }
};

const insertUser = async (req, res) => {
  try {
    console.log(req.body);
    const userExist = await User.findOne({ email: req.body.email });

    if (userExist) {
      return res.render("registration", { messages: "User already exists" });
    } else {
      // Check if the password and confirm password match
      if (req.body.password !== req.body.confirmPassword) {
        req.flash("message", "Password do not match");
        return res.redirect("/register");
      } else {
        const spassword = await securePassword(req.body.password);

        const user = new User({
          name: req.body.name,
          email: req.body.email,
          password: spassword,
          is_admin: 0,
        });

        const userData = await user.save().then((result) => {
          sendOTPVerificationEmail(result, res);
        });

        if (userData) {
          await sendOTPVerificationEmail(userData.email);
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

// send OTP Verification Email -----------------

const sendOTPVerificationEmail = async ({ email }, res) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      // host: 'smtp.gmail.com',
      // port: 587,
      // secure: true,
      auth: {
        user: "hadimujeeb300@gmail.com",
        pass: "ogovpoenykqxjwqt",
      },
    });

    const otp = ` ${Math.floor(1000 + Math.random() * 9000)}`;
    console.log("email:", email);
    console.log("from:", "hadimujeeb300@gmail.com");

    // mail options
    const mailOptions = {
      from: "hadimujeeb300@gmail.com",
      to: email,
      subject: "Verify Your Email",
      html: `<p>Enter <b> ${otp} </b> in the app to verify your email address </p>`,
    };

    //hash otp
    const saltRounds = 10;
    // const hashedOTP = await bcrypt.hash(otp, saltRounds);

    const newOTPVerification = await new UserOTPVerification({
      email: email,
      otp: otp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });

    await newOTPVerification.save();
    await transporter.sendMail(mailOptions);

    res.redirect(`/verifyOTP?email=${email}`);
  } catch (error) {
    console.log(error.message);
  }
};

//--------------

const loadOtpPage = async (req, res) => {
  try {
    const email = req.query.email;

    res.render("verifyOTP", { email: email });
  } catch (error) {
    console.log(error.message);
  }
};

// ----------------------------verifyOtp---------

const verifyOtp = async (req, res) => {
  try {
    const email = req.body.email;
    const sessions = req.session.email
    console.log("email",sessions)
    console.log("email:", email);
    const otp = req.body.one + req.body.two + req.body.three + req.body.four;

    console.log("otp:", otp);
    const user = await UserOTPVerification.findOne({ email: sessions});
    // console.log("user:", user);

    if (!user || user.attempts >= 3) {
      console.log("user:", user);

      // If no user found or maximum attempts reached, render a message and return
      res.render("verifyOTP", {
        message: "OTP expired or too many incorrect attempts.",
        
      });
      console.log("email",sessions);
      return;
    }

    // user.otp mean serOTPVerification here have  that is user otp

    const hashedOTP = user.otp;
    console.log("uj6uj7uju", otp, "yhyhhyyhyh", hashedOTP);

    // const validOtp = await bcrypt.compare(otp, hashedOTP);
    // console.log(hashedOTP);

    if (otp == hashedOTP) {
      console.log("fjdif");
      const userData = await User.findOne({ email: sessions });
      await User.findByIdAndUpdate(
        // _id mean any id

        { _id: userData._id },
        { $set: { is_Verified: 1 } }
      );
      await UserOTPVerification.deleteOne({ email: sessions });

      res.redirect("/home");
    } else {
      // Increment the attempts counter or set it to 1 if it doesn't exist
      const attempt = (user.attempts || 0) + 1;

      // Update the attempts counter in the UserOTPVerification collection
      await UserOTPVerification.updateOne(
        { email: email },
        { $set: { attempts: attempt } },
        { upsert: true }
      );

      if (attempt  >= 3) {
        // If the maximum number of attempts is reached, delete the email record
        await UserOTPVerification.deleteOne({ email: emails });
      }

      res.render("verifyOTP", { message: "Incorrect OTP. Please try again." });

    }
  } catch (error) {
    console.log(error.message);
  }
};

//------------------------------------LOGIN-----------------------------------------------------------------------

const Homepage = async (req, res) => {
  try {
    const { user_id } = req?.session;
    const user = await User.findOne({ _id: user_id });
    res.render("home", { user });
  } catch (error) {
    console.log(error.message);
  }
};

// -----------------------------

const LoginPage = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

// ------------------------------
const VerifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });

    if (userData) {
      console.log("pass", userData.password);

      const passwordMatch = await bcrypt.compare(password, userData.password);

      console.log(passwordMatch);
      if (passwordMatch) {
        req.session.user_id = userData._id;
        res.redirect("/home");
      } else {
        res.render("login", { message: "Email and password is incorrect" });
      }
    } else {
      res.render("login", { message: "Email and password is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const userLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

const Loadshop = async (req, res) => {
  try {
    const products = await Product.find({});
    const Category = await Categories.find({});
    res.render("shop", { products, Category });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  Homepage,
  RegisterPage,
  insertUser,
  LoginPage,
  loadOtpPage,
  verifyOtp,
  VerifyLogin,
  userLogout,
  Loadshop,
};
