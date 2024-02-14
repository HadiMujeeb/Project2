const User = require("../Models/userModel");
const Cart = require("../Models/cartModel");

const isLogin = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      next();
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err.message);
  }
};

const isBlock = async (req, res, next) => {
  try {
    const user = await User.findById({ _id: req.session.user_id });
    if (user) {
      if (user.isBlocked === true) {
        next();
      } else {
        req.session.destroy();
        res.redirect("/login");
      }
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err.message);
  }
};

const isLogout = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      res.redirect("/home");
      return;
    }
    next();
  } catch (err) {
    console.log(err.message);
  }
};


const stop = async (req, res, next) => {
  try {
    const cart = await Cart.find({});
    if (!cart || cart.length === 0) {
      return res.redirect("/shop");
    }
    next();
  } catch (error) {
    console.log(error.message);

    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  isLogin,
  isLogout,
  isBlock,
  stop,
};
