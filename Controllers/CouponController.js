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
      startingDate,
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
        startingDate: startingDate,
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

const AddCouponCart = async (req, res) => {
  try {
    if (!req.session.user_id) {
      res.redirect("/login");
      return;
    }
    const { couponID, cartId } = req.body;
    console.log("coupon", couponID);
    const coupon = await Coupon.findById(couponID);

    if (!coupon) {
      console.log("coupon is not available");
      return;
    }
    const cart = await Cart.findById(cartId);

    if (cart.couponDiscount !== null) {
      console.log("coupon already added");
      return;
    }

    if (
      coupon &&
      coupon.userUsed.some(
        (user) => user.user_id.toString() === req.session.user_id.toString()
      )
    ) {
      console.log("Coupon has been used by the user");
      res.json({ success: false });
    } else {
      const cart = await Cart.findByIdAndUpdate(
        { _id: cartId },
        { $set: { couponDiscount: couponID } }
      );
      const coupon = await Coupon.findByIdAndUpdate(
        couponID,
        { $addToSet: { userUsed: { user_id: req.session.user_id } } },
        { new: true }
      );

      console.log("Coupon has not been used by the user");
      res.json({ success: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const CheckRemoveCoupon = async (req, res) => {
  try {
    console.log("hisdfefwewi");
    const { cartId } = req.body;

    const cart = await Cart.findById(cartId);
    const coupon = await Coupon.findByIdAndUpdate(cart.couponDiscount, {
      $unset: { userUsed: 1 },
    });

    await Cart.findByIdAndUpdate(
      cartId,
      { $unset: { couponDiscount: null } },
      { new: true }
    );

    res.json({ success: true });
  } catch (error) {}
};
module.exports = {
  LoadCoupon,
  LoadAddCoupon,
  AddCoupon,
  RemoveCoupon,
  AddCouponCart,
  CheckRemoveCoupon,
};
