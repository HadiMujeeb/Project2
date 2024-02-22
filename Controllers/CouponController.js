const mongoose = require("mongoose");
const Coupon = require("../Models/CouponModel");
const Cart = require("../Models/cartModel");

const LoadCoupon = async (req, res) => {
  try {
    if (!req.session.admin) {
      res.redirect("/admin");
    }
    const couponData = await Coupon.find({});
    res.render("coupon", { couponData });
  } catch (error) {
    console.log(error.message);
  }
};

const LoadAddCoupon = async (req, res) => {
  try {
    if (!req.session.admin) {
      res.redirect("/admin");
    }
    res.render("addCoupon");
  } catch (error) {
    console.log(error.message);
  }
};

const AddCoupon = async (req, res) => {
  try {
    const {
      name,
      couponCode,
      description,
      discountAmount,
      minAmount,
      expire,
    } = req.body;
    if (!req.session.admin) {
      res.redirect("/admin");
    } else {
      const couponData = new Coupon({
        couponName: name,
        couponCode: couponCode,
        discountAmount: discountAmount,
        minAmount: minAmount,
        couponDescription: description,
        expiryDate: expire,
      });
      const data = await couponData.save();
      res.redirect("/loadCoupon");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const RemoveCoupon = async (req, res) => {
  try {
    if (!req.session.admin) {
      res.redirect("/admin");
    } else {
      const id = req.query.id;
      console.log("hii", id);
      const coupon = await Coupon.findOne({ _id: id });
      if (coupon) {
        await Coupon.deleteOne({ _id: id });
        res.redirect("/loadCoupon");
      } else {
        console.log("user not defend");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const applyCoupon = async (req, res) => {
  try {
    const couponId = req.body.id;
    const userId = req.session.userId;
    const currentDate = new Date();
    const CouponData = await Coupon.findOne({
      _id: couponId,
      expiryDate: { $gt: currentDate },
    });
    const Exist = CouponData.userUsed.includes(userId);

    if (!Exist) {
      const existCart = await Cart.findOne({ user_id: userId });

      if (existCart && existCart.coupondicount == null) {
        const addUser = await Coupon.findByIdAndUpdate(
          { _id: couponId },
          { $push: { userUsed: userId } }
        );

        const addCart = await Cart.findOneAndUpdate(
          { user_id: userId },
          { $set: { coupondicount: CouponData._id } }
        );

        res.json({ coupon: true, CouponData });
      } else {
        res.json({ coupon: "Already Applied" });
      }
    } else {
      res.json({ coupon: "AlreadyUsed" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const CheckRemoveCoupon = async (req, res) => {
  try {
    const couponId = req.body.id;
    const userId = req.session.user_id;
    const CouponData = await Coupon.findByIdAndUpdate(
      { _id: couponId },
      { $pull: { userUsed: userId } }
    );
    const cartUpdate = await Cart.findOneAndUpdate(
      { user_id: userId },
      { $set: { coupondicount: null } }
    );
    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {
  LoadCoupon,
  LoadAddCoupon,
  AddCoupon,
  RemoveCoupon,
};
