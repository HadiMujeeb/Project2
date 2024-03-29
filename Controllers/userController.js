const User = require("../Models/userModel");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const UserOTPVerification = require("../Models/userOTPVerification");
const Product = require("../Models/productModel");
const Categories = require("../Models/categoriesModel");
const randomstrings = require("randomstring");
const { default: mongoose } = require("mongoose");
const Order = require("../Models/OrderModel");
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const puppeteer = require("puppeteer-core");

const generateReferralCode = (length) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};
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

    if (userExist && userExist.is_Verified == 1) {
      return res.render("registration", { messages: "User already exists" });
    } else {
      // Check if the password and confirm password match
      if (req.body.password !== req.body.confirmPassword) {
        req.flash("message", "Password do not match");
        return res.redirect("/register");
      } else {
        let walletAmount;
        const referralCode = generateReferralCode(8);
        const spassword = await securePassword(req.body.password);
        if (
          req.body.referralCode !== null ||
          req.body.referralCode !== undefined
        ) {
          const result = 50;
          const user = await User.findOne({
            referalcode: req.body.referralCode,
          });
          if (user) {
            await User.findOneAndUpdate(
              { referalcode: req.body.referralCode },
              { $inc: { wallet: result.toFixed(0) } }
            );
            walletAmount = result;
          } else {
            console.log(" there is no user based this referral");
            walletAmount = 0;
          }
        } else {
          console.log("there is no referral");
          walletAmount = 0;
        }

        const user = new User({
          name: req.body.name,
          email: req.body.email,
          password: spassword,
          is_admin: 0,
          mobile: req.body.mobile,
          referalcode: referralCode,
          wallet: walletAmount,
        });
        req.session.email = req.body.email;
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
        user: process.env.AUTH_MAIL,
        pass: "ogovpoenykqxjwqt",
      },
    });

    const otp = ` ${Math.floor(1000 + Math.random() * 9000)}`;
    console.log("email:", email);
    console.log("from:", process.env.AUTH_MAIL);

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
    const expiresIn = 1 * 60 * 1000;
    setTimeout(async () => {
      await UserOTPVerification.deleteOne({ email: email });
      console.log("Expired OTP deleted.");
  }, expiresIn);

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

    // req.session.email = email
    const sessions = req.session.email;
    console.log("email", sessions);
    console.log("email:", email);
    const otp = req.body.one + req.body.two + req.body.three + req.body.four;

    console.log("otp:", otp);
    const user = await UserOTPVerification.findOne({ email: sessions });
    

    if (!user ) {
      // console.log("user:", user);

      res.render("verifyOTP", {
        message: "OTP expired or too many incorrect attempts.",
      });

      return;
    }

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
     
      await UserOTPVerification.deleteMany({ email: sessions });
      const userId = await User.findOne({email:sessions,is_Verified:1})
      req.session.user_id = userId._id;
      res.redirect("/home");
    } else {
      res.render("verifyOTP", { message: "OTP is incorrect", sessions });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const resendOTP = async (req, res) => {
  try {
    console.log("bodyis", req.body);
    const email = req.body.email;
    await UserOTPVerification.deleteMany({});
    await sendOTPVerificationEmail({ email }, res);
  } catch (error) {
    console.log(error.message);
  }
};

const deleteExpiredOtps = async (req, res) => {
  const email = req.body.email;
  console.log("hello", email);
  await UserOTPVerification.deleteMany({});
};

//------------------------------------LOGIN-----------------------------------------------------------------------

const Homepage = async (req, res) => {
  try {
    const product = await Product.find({})
      .populate("Offer")
      .populate({ path: "category", populate: { path: "Offer" } });
    const { user_id } = req?.session;
    const user = await User.findOne({ _id: user_id });
    // console.log("hii", product);
    res.render("home", { user, product });
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

    if (userData && userData.is_Verified == 1) {
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
    -console.log(error.message);
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

const loadShop = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.session.user_id });

    const categId = req.query.categid;

    let products = [];
    let category;
    if (categId) {
      const CategoryId = new mongoose.Types.ObjectId(categId);
      category = await Categories.findOne({ _id: CategoryId });
      products = await Product.find({ category: CategoryId })
        .populate({ path: "category", populate: { path: "Offer" } })
        .populate("Offer");
      console.log("linkproduct", products);
    } else {
      products = await Product.find({})
        .populate({ path: "category", populate: { path: "Offer" } })
        .populate("Offer");
    }

    const Categdata = await Categories.find({});
    const listedCategory = Categdata.filter((categ) => categ.isListed === true);
    console.log(listedCategory);

    const listProduct = products.filter((product) => {
      const isProductListed = product.is_Listed == true;

      const productCategory = listedCategory.find(
        (category) =>
          category.name === (product.category && product.category.name) &&
          category.isListed == true
      );

      return isProductListed && productCategory;
    });

    res.render("shop", {
      Categories: listedCategory,
      products: listProduct,
      user,
      category,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const shopFilter = async (req, res) => {
  try {
    const { categoryId } = req.body;
    // console.log(categoryId, "working");

    const Categdata = await Categories.find({});
    const listedCategory = Categdata.filter((categ) => categ.isListed === true);

    if (categoryId && categoryId !== "") {
      products = await Product.find({ category: categoryId })
        .populate({ path: "category", populate: { path: "Offer" } })
        .populate("Offer");
      console.log("linkproduct", products);
    } else {
      products = await Product.find({})
        .populate({ path: "category", populate: { path: "Offer" } })
        .populate("Offer");
      console.log("linkproduct", products);
    }
    res.json({ success: true, products });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

const searchFilter = async (req, res) => {
  try {
    let { searchTerm, categoryId } = req.body;
    console.log("searchTerm", searchTerm);
    console.log("categoryId", categoryId);
    let products = await Product.find({});
    if (categoryId && categoryId != undefined) {
      const products = await Product.find({ category: categoryId });
      const regexPattern = new RegExp(searchTerm, "i");
      const filteredProducts = products.filter((product) =>
        regexPattern.test(product.name)
      );
      res.json({ products: filteredProducts });
    } else {
      const regexPattern = new RegExp(searchTerm, "i");
      const filteredProducts = products.filter((product) =>
        regexPattern.test(product.name)
      );
      res.json({ products: filteredProducts });
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

const SingleProduct = async (req, res) => {
  try {
    const productId = req.query.productId;
    console.log("ProductId:", productId);
    const user = await User.findOne({ _id: req.session.user_id });
    const product = await Product.findOne({ _id: productId })
      .populate({ path: "category", populate: { path: "Offer" } })
      .populate("Offer");
    // if (user) {
    res.render("singleproduct", { product, user });
    // } else {
    //   res.redirect("/login");
    // }
  } catch (error) {
    console.log(error.message);
  }
};

const ForgetLoad = async (req, res) => {
  try {
    res.render("forgetpassword");
  } catch (error) {
    console.log(error.message);
  }
};

const forgetpasswordVerify = async (req, res) => {
  try {
    const email = req.body.email;
    const details = await User.findOne({ email: email });
    if (details) {
      if (details.is_Verified == 0) {
        res.render("forgetpassword", { message: "please Verify your email" });
      } else {
        const randomstring = randomstrings.generate();
        const updatedetail = await User.updateOne(
          { email: email },
          { $set: { token: randomstring } }
        );
        sendforgetemail(details.name, details.email, randomstring);
        res.render("forgetpassword", { message: "Please check your email" });
      }
    } else {
      res.render("forgetpassword", { message: "Email is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const sendforgetemail = async (name, email, token) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: process.env.AUTH_MAIL,
        pass: "ogovpoenykqxjwqt",
      },
    });

    const mailOptions = {
      from: process.env.AUTH_MAIL,
      to: email,
      subject: "For Reset Password",
      html:
        "<p>Hii " +
        name +
        ', please click here to <a href="http://127.0.0.1:11000/forgetpassword?token=' +
        token +
        '">Reset</a> your password.</p>',
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error.message);
  }
};

const ResetPasswordLoad = async (req, res) => {
  try {
    const token = req.query.token;
    const TOkenId = await User.findOne({ token: token });
    if (TOkenId) {
      res.render("resetpassword", { message: "", TOkenId: TOkenId });
      console.log("too", TOkenId);
    } else {
      res.redirect("/forget");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const resetpassword = async (req, res) => {
  try {
    const password = req.body.Password;
    const confirmPassword = req.body.confirmPassword;

    const Token = req.body.TOkenId;
    console.log("hello", Token);

    console.log("password", password);
    console.log("confirmPassword", confirmPassword);

    if (password == confirmPassword && Token) {
      const secure = await securePassword(password);
      const updatepass = await User.findOneAndUpdate(
        { _id: Token },
        { $set: { password: secure } }
      );
      res.redirect("/login");
    } else {
      res.render("forgetpassword", { message: "password does not match" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const LoadProfile = async (req, res) => {
  try {
    let user;
    let data;
    if (req.session.user_id) {
      const id = req.session.user_id;
      user = await User.findOne({ _id: id });
      user.wallet_history.sort((a, b) => b.date - a.date);
      console.log(data, "data");
    }
    // const result = await Order.deleteMany({ status: "Pending" });
    const order = await Order.find({ user_id: user._id }).sort({
      createdAt: -1,
    });

    res.render("profile", { user, order });
  } catch (error) {
    console.log(error.message);
  }
};

const EditProfile = async (req, res) => {
  try {
    const id = req.session.user_id;

    console.log("id", id);
    const { name, mobile } = req.body;
    console.log("body", req.body);
    const user = await User.findOne({ _id: id });
    console.log("user", user);

    const update = await User.findByIdAndUpdate(
      { _id: id },
      { $set: { name: name, mobile: mobile } },
      { new: true }
    );
    console.log("upda", update);
    if (!update) {
      console.log("jwjndweid");
      return res.status(404).json({ message: "User not found" });
    }

    res.redirect("/profile");
  } catch (error) {
    console.log(error.message);
  }
};

const LOADaddaddress = async (req, res) => {
  try {
    const id = req.session.user_id;
    res.render("addaddress", { user: id });
  } catch (error) {
    console.log(error.message);
  }
};

const AddAddress = async (req, res) => {
  try {
    const { name, mobile, pincode, address, city, landmark, state } = req.body;
    const id = req.session.user_id;
    console.log("id", id);
    const user = await User.findOne({ _id: id });
    console.log("user", user);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const newAddress = {
      name,
      mobile,
      pincode,
      address,
      city,
      state,
      landmark,
    };
    console.log("add", newAddress);
    user.addresses.push(newAddress);
    await user.save();
    res.redirect("/profile");
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const DeleteAddress = async (req, res) => {
  try {
    const { id, index } = req.query;

    console.log("hello", index);
    console.log("hel", id);

    const user = await User.findOne({ _id: id });

    console.log("user", user);

    if (index >= 0 && index < user.addresses.length) {
      user.addresses.splice(index, 1);

      await user.save();

      res.redirect("/profile");
    } else {
      res.status(400).json({ error: "Invalid index" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const LoadEditAddress = async (req, res) => {
  try {
    const user = req.session.user_id;

    const address = req.query.userId;

    console.log("ds", address);

    const data = await User.findOne({ _id: user });
    let newData = data.addresses.find((value) => value.id == address);
    console.log(newData, "hhhhhhh");
    res.render("editaddress", { newData });
  } catch (error) {
    console.log(error.message);
  }
};

const EditAddress = async (req, res) => {
  try {
    const {
      name,
      mobile,
      pincode,
      address,
      city,
      landmark,
      state,
      AddressId,
    } = req.body;
    const id = req.session.user_id;
    console.log("idss", AddressId);

    const user = await User.findOne({ _id: id });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: id, "addresses._id": AddressId },
      {
        $set: {
          "addresses.$.name": name,
          "addresses.$.mobile": mobile,
          "addresses.$.pincode": pincode,
          "addresses.$.address": address,
          "addresses.$.city": city,
          "addresses.$.landmark": landmark,
          "addresses.$.state": state,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "Address not found" });
    }

    res.redirect("/profile");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// const rest_pass_profile = async (req,res)=>{
// try {
//   re.render("resetProfile")
// } catch (error) {
//   console.log(error.messages);
// }
// }

const downloadInvoice = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    console.log(orderId);
    const order = await Order.findOne({ _id: orderId }).populate(
      "items.product_id"
    );

    const date = new Date();
    const data = {
      order: order,
      date,
    };

    const filepathName = path.resolve(__dirname, "../views/user/invoice.ejs");
    const html = fs.readFileSync(filepathName).toString();
    const ejsData = ejs.render(html, data);
    const browser = await puppeteer.launch({ headless: "new",executablePath:'/snap/bin/chromium' });
    const page = await browser.newPage();
    await page.setContent(ejsData, { waitUntil: "networkidle0" });
    const pdfBytes = await page.pdf({ format: "Letter" });
    await browser.close();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename= orderInvoice_Skyzon .pdf"
    );
    res.send(pdfBytes);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Error generating invoice");
  }
};
module.exports = {
  Homepage,
  RegisterPage,
  insertUser,
  LoginPage,
  loadOtpPage,
  verifyOtp,
  deleteExpiredOtps,
  resendOTP,
  VerifyLogin,
  userLogout,
  loadShop,
  SingleProduct,
  ForgetLoad,
  forgetpasswordVerify,
  ResetPasswordLoad,
  resetpassword,
  LoadProfile,
  EditProfile,
  LOADaddaddress,
  AddAddress,
  DeleteAddress,
  LoadEditAddress,
  EditAddress,
  shopFilter,
  searchFilter,
  downloadInvoice,
  // rest_pass_profile
};
