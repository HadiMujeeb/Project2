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

// const applyCoupon = async (req, res) => {
//   try {
//     const couponId = req.body.id;
//     const userId = req.session.userId;
//     const currentDate = new Date();
//     const CouponData = await Coupon.findOne({
//       _id: couponId,
//       expiryDate: { $gt: currentDate },
//     });
//     const Exist = CouponData.userUsed.includes(userId);

//     if (!Exist) {
//       const existCart = await Cart.findOne({ user_id: userId });

//       if (existCart && existCart.coupondicount == null) {
//         const addUser = await Coupon.findByIdAndUpdate(
//           { _id: couponId },
//           { $push: { userUsed: userId } }
//         );

//         const addCart = await Cart.findOneAndUpdate(
//           { user_id: userId },
//           { $set: { coupondicount: CouponData._id } }
//         );

//         res.json({ coupon: true, CouponData });
//       } else {
//         res.json({ coupon: "Already Applied" });
//       }
//     } else {
//       res.json({ coupon: "AlreadyUsed" });
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };

// const CheckRemoveCoupon = async (req, res) => {
//   try {
//     const couponId = req.body.id;
//     const userId = req.session.user_id;
//     const CouponData = await Coupon.findByIdAndUpdate(
//       { _id: couponId },
//       { $pull: { userUsed: userId } }
//     );
//     const cartUpdate = await Cart.findOneAndUpdate(
//       { user_id: userId },
//       { $set: { coupondicount: null } }
//     );
//     res.json({ success: true });
//   } catch (error) {
//     console.log(error.message);
//   }
// };

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
  console.log(cart,"cart")

  if (!cart.couponDiscount  || cart.couponDiscount !== null) {
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

      if (cart && coupon) {
        console.log("Coupon has not been used by the user");
        res.render("ProceedCheckout")
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const CheckRemoveCoupon  = async (req,res)=>{
  try {
    console.log("hisdfefwewi")
    const {cartId}= req.body
    const cart = await Cart.findByIdAndUpdate(
      cartId,
      { $unset: { couponDiscount: null } },
      { new: true }
  );
   res.json({success:true})
  } catch (error) {
    
  }
}
module.exports = {
  LoadCoupon,
  LoadAddCoupon,
  AddCoupon,
  RemoveCoupon,
  AddCouponCart,
  CheckRemoveCoupon 
};
