const mongoose = require("mongoose");

const CartModel = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  items: [
    {
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
      productName: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
      price: {
        type: Number,
        required: true,
      },
      total_price: {
        type: Number,
        required: true,
      },
      category: {
        type: String,
        required: true,
      },
      brand: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        default: "placed",
      },
      cancellationReason: {
        type: String,
        default: "none",
      },
      Offer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"offer",
      },
      CategoryId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
      },
    },
  ],
  couponDiscount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coupon",
    default:null,
  },
});

const Cart = mongoose.model("Cart", CartModel);
module.exports = Cart;
