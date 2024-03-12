const Cart = require("../Models/cartModel");
const Product = require("../Models/productModel");
const Category = require("../Models/categoriesModel");
const User = require("../Models/userModel");
const ObjectId = require("mongoose").Types.ObjectId;
const Order = require("../Models/OrderModel");
const { now } = require("mongoose");
const Coupon = require("../Models/CouponModel");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { generate } = require("randomstring");
const { Console, log } = require("console");
const LedgerBook = require("../Models/legdeModel");
var instance = new Razorpay({
  key_id: "rzp_test_Zdu4uWOEbGyw30",
  key_secret: "szr5SFPPifbykQd7YtHKeZHr",
});

const loadCart = async (req, res) => {
  try {
    let user;
    if (req.session.user_id) {
      id = req.session.user_id;
      user = await User.findOne({ _id: id });
    }

    if (!user) {
      res.redirect("/login");
    }
    const cartDetails = await Cart.findOne({ user_id: id }).populate({
      path: "items.product_id",
      populate: [
        { path: "Offer" },
        { path: "category", populate: { path: "Offer" } },
      ],
    });
    const cart = await Cart.findOne({ user_id: user }).populate(
      "items.product_id"
    );

    const userData = await User.findOne({ _id: user._id });

    let originalAmount = 0;
    if (cartDetails) {
      cartDetails.items.forEach((cartItem) => {
        let itemTotalPrice = cartItem.total_price;
        originalAmount += itemTotalPrice;
      });
    }

    res.render("cart", { user: userData, cartDetails, originalAmount, cart });
  } catch (error) {
    console.log(error.message);
  }
};

const AddToCart = async (req, res) => {
  try {
    const {
      productId,
      quantity,
      productPrice,
      productName,
      category,
      brand,
      categoryId,
    } = req.body;
    console.log(req.body);

    let user;

    if (req.session.user_id) {
      const id = req.session.user_id;
      console.log("if", id);

      user = await User.findOne({ _id: id });
    }

    if (!user) {
      res.json({ success: false, message: "User not logged in" });
      return;
    } else {
      const product = await Product.findOne({ _id: productId });

      const id = user._id;
      console.log("id", id);

      const cart = await Cart.findOne({ user_id: id });

      if (cart) {
        const existProduct = cart.items.find(
          (x) => x.product_id.toString() === productId
        );
        if (existProduct) {
          let newTotalQuantity;
          if (existProduct.quantity < 3) {
            newTotalQuantity = existProduct.quantity + quantity;
          } else {
            return res.json({
              success: false,
              message: "Were are sorry! Only 3 unit(s) allowed in each order.",
            });
          }

          if (newTotalQuantity > product.stockQuantity) {
            res.json({ success: false, message: "Exceeds available quantity" });
            return;
          }
          await Cart.findOneAndUpdate(
            { user_id: id, "items.product_id": productId },
            {
              $inc: {
                "items.$.quantity": quantity,
                "items.$.total_price":
                  parseInt(quantity, 10) *
                  parseFloat(productPrice.replace(",", "")),
              },
            }
          );
        } else {
          if (parseInt(quantity, 10) > product.stockQuantity) {
            res.json({ success: false, message: "Exceeds available quantity" });
            return;
          }
          await Cart.findOneAndUpdate(
            { user_id: id },
            {
              $push: {
                items: {
                  product_id: productId,
                  productName: productName,
                  quantity: quantity,
                  price: productPrice,
                  total_price: quantity * productPrice,
                  category: category,
                  brand: brand,
                  Offer: product.Offer,
                  CategoryId: categoryId,
                },
              },
            }
          );

          console.log("hiii");
        }
      } else {
        if (parseInt(quantity, 10) > product.stockQuantity) {
          res.json({ success: false, message: "Exceeds available quantity" });
          return;
        }
        const newCart = new Cart({
          user_id: id,
          items: [
            {
              product_id: productId,
              productName: productName,
              quantity: quantity,
              price: product.price,
              total_price: quantity * product.price,
              category: category,
              brand: brand,
              Offer: product.Offer,
              CategoryId: categoryId,
            },
          ],
        });

        await newCart.save();
      }
      res.json({ success: true });
    }
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const UpdateQuantity = async (req, res) => {
  try {
    // console.log("body:", req.body);

    let user;
    // console.log("cart session", req.session.user_id);
    if (req.session.user_id) {
      const id = req.session.user_id;
      user = await User.findOne({ _id: id });
    }

    const productId = req.body.productId;
    // console.log(productId);
    const count = req.body.count;

    const cart = await Cart.findOne({ user_id: req.session.user_id });

    if (!cart) {
      return res.json({ success: false, message: "Cart not found." });
    }

    const cartProduct = cart.items.find(
      (item) => item.product_id.toString() === productId
    );
    console.log("cartProducts:", cartProduct);

    if (!cartProduct) {
      return res.json({
        success: false,
        message: "Product not found in the cart.",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      console.log("Product not found in the database.");
      return res.json({
        success: false,
        message: "Product not found in the database.",
      });
    }
    if (count == 1) {
      if (cartProduct.quantity < 3) {
        if (cartProduct.quantity < product.stockQuantity) {
          await Cart.updateOne(
            { user_id: req.session.user_id, "items.product_id": productId },
            {
              $inc: {
                "items.$.quantity": 1,
                "items.$.total_price": product.price,
              },
            }
          );

          return res.json({ success: true });
        } else {
          return res.json({
            success: false,
            message: "no more quantity.",
          });
        }
      } else {
        return res.json({
          success: false,
          message: "We're sorry! Only 3 unit(s) allowed in each order.",
        });
      }
    }

    if (count == -1) {
      if (cartProduct.quantity > 1) {
        await Cart.updateOne(
          { user_id: req.session.user_id, "items.product_id": productId },
          {
            $inc: {
              "items.$.quantity": -1,
              "items.$.total_price": -product.price,
            },
          }
        );
        // await Product.findByIdAndUpdate(
        //   { _id: productId },
        //   { $inc: { stockQuantity: 1 } }
        // );
        return res.json({ success: true });
      } else {
        return res.json({
          success: false,
          message: "Quantity cannot be less than 1.",
        });
      }
    }
  } catch (error) {
    console.log("error.message");
  }
};

const deleteItems = async (req, res) => {
  try {
    let user;
    console.log("cart session", req.session.user_id);
    if (req.session.user_id) {
      const id = req.session.user_id;
      user = await User.findOne({ _id: id });
    }

    const productId = req.body.productId;
    console.log(req.body.productId[1]);
    const cartUser = await Cart.findOne({ user_id: user });

    let quantity;
    let PRDid;
    const CartQuantity = cartUser.items.find((item) => {
      quantity = item.quantity;
      PRDid = item.product_id;
    });

    console.log(quantity, "ddd");
    if (cartUser.items.length == 1) {
      await Cart.deleteOne({ user_id: user });

      console.log(CartQuantity, "ddd");
    } else {
      await Cart.updateOne(
        { user_id: user },
        { $pull: { items: { _id: productId[1] } } }
      );
    }

    // await Product.findByIdAndUpdate(
    //   { _id: PRDid },
    //   { $inc: { stockQuantity: quantity } }
    // );

    res.redirect("/cart");
  } catch (error) {
    console.log(error.message);
  }
};

const LoadCheckout = async (req, res) => {
  try {
    if (!req.session.user_id) {
      res.redirect("/login");
    } else {
      const id = req.session.user_id;

      const user = await User.findOne({ _id: id });

      const product = await Cart.findOne({ user_id: user })
        .populate({
          path: "items.product_id",
          populate: [
            { path: "Offer" },
            { path: "category", populate: { path: "Offer" } },
          ],
        })
        .populate("couponDiscount");

      if (!product) {
        res.redirect("/shop");
        return;
      }

      let totalPrice = 0;

      product.items.forEach((item) => {
        totalPrice += parseFloat(item.total_price);
      });

      const coupon = await Coupon.aggregate([
        {
          $match: {
            minAmount: { $lte: totalPrice },
          },
        },
      ]);

      res.render("ProceedCheckout", {
        user,
        product,
        id,
        coupon,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

let referral;
let TotalAmount;
const Checkout = async (req, res) => {
  try {
    const { addressId, totalPrice, paymentMethod, referralCode } = req.body;
    referral = referralCode;
    TotalAmount = totalPrice;
    if (!req.session.user_id) {
      res.redirect("/login");
    } else {
      console.log("hii");

      const id = req.session.user_id;
      const user = await User.findOne({ _id: id });
      const cart = await Cart.findOne({ user_id: user })
        .populate("items.product_id")
        .populate("items.Offer")
        .populate({
          path: "items.CategoryId",
          populate: {
            path: "Offer",
          },
        })
       console.log("helllll");
      for (const cartItem of cart.items) {
        const product = cartItem.product_id;
        const requestedQuantity = cartItem.quantity;
        if (product.stockQuantity < requestedQuantity) {
          return res.status(400).json({
            success: false,
            message: `Not enough quantity available for product ${product.name}`,
          });
        }
      }
      let coupon;
      if (cart.couponDiscount) {
        coupon = await Coupon.findOne({ _id: cart.couponDiscount });
      }

      if (cart) {
        const orderItems = cart.items.map((item) => {
          let totalPrice = item.total_price;
          let Price = item.price;
          if (item.Offer) {
            totalPrice =
              (item.total_price * (100 - item.Offer.percentage)) / 100;
            Price = (item.price * (100 - item.Offer.percentage)) / 100;
          } else if (item.CategoryId && item.CategoryId.Offer) {
            console.log("heklsdjsncdskjn");
            totalPrice =
              (item.total_price * (100 - item.CategoryId.Offer.percentage)) /
              100;
            Price =
              (item.price * (100 - item.CategoryId.Offer.percentage)) / 100;
          }
          return {
            product_id: item.product_id,
            productName: item.productName,
            quantity: item.quantity,
            price: Price,
            total_price: totalPrice,
            ordered_status: "Placed",
            cancellationReason: "none",
            category: item.category,
            brand: item.brand,
          };
        });
        console.log("ddadewq", orderItems);

        console.log("product", orderItems.ProductName);
        const order = new Order({
          user_id: user._id,
          payment: paymentMethod,
          delivery_address: addressId,
          user_name: user.name,
          total_amount: totalPrice,
          items: orderItems,
          date: new Date(),
          status: "Pending",
          CouponDiscount: coupon?.discountAmount || 0,
        });

        await order.save();
        console.log("Order placed successfully");
        if (order) {
          console.log("orderid", order._id);

          if (paymentMethod === "Cash-on-Delivery") {
            // if(totalPrice)

            await Order.findByIdAndUpdate(order._id, {
              $set: { status: "Placed" },
            });
            // if (referralCode !== null) {
            //   const percentage = 5;
            //   const result = (percentage / 100) * totalPrice;
            //   const user = await User.findOne({ referalcode: referralCode });
            //   if (user) {
            //     await User.findOneAndUpdate(
            //       { referalcode: referralCode },
            //       { $inc: { wallet: result.toFixed(0) } }
            //     );
            //   } else {
            //     console.log(" there is no user based this referral");
            //   }
            // } else {
            //   console.log("there is no referral");
            // }

            const cart = await Cart.findOne({ user_id: req.session.user_id });

            for (const Data of cart.items) {
              await Product.updateOne(
                { _id: Data.product_id },
                { $inc: { stockQuantity: -Data.quantity } }
              );
            }

            await Cart.deleteMany({});
            res.json({ success: true, order: order._id });
          } else if (paymentMethod === "Cash-on-online") {
            const orders = await instance.orders.create({
              amount: totalPrice * 100,
              currency: "INR",
              receipt: "" + order._id,
            });

            await Cart.deleteMany({});
            console.log(orders, "hii");
            return res.json({ success: false, orders, referralCode });
          } else {
            const userId = await User.findById({ _id: req.session.user_id });
            if (userId.wallet < totalPrice) {
              console.log("wallet is 0");
              res.json({ message: "Operation failed" });
              return;
            }

            await Order.findByIdAndUpdate(order._id, {
              $set: { status: "Placed" },
            });
            const user = await User.findByIdAndUpdate(
              { _id: order.user_id },
              {
                $inc: { wallet: -order.total_amount },
                $push: {
                  wallet_history: {
                    date: new Date(),
                    amount: order.total_amount,
                    description: "Placed",
                    paymentMethod: order.payment,
                  },
                },
              }
            );
            // if (referralCode !== null) {
            //   const percentage = 5;
            //   const result = (percentage / 100) * totalPrice;
            //   const user = await User.findOne({ referalcode: referralCode });
            //   if (user) {
            //     await User.findOneAndUpdate(
            //       { referalcode: referralCode },
            //       { $inc: { wallet: result.toFixed(0) } }
            //     );
            //   } else {
            //     console.log(" there is no user based this referral");
            //   }
            // } else {
            //   console.log("there is no referral");
            // }

            const cart = await Cart.findOne({ user_id: req.session.user_id });

            for (const Data of cart.items) {
              await Product.updateOne(
                { _id: Data.product_id },
                { $inc: { stockQuantity: -Data.quantity } }
              );
            }
            await Cart.deleteMany({});
            res.json({ success: true, order: order._id });
          }
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const PendingPay = async (req, res) => {
  try {
    const { orderId, totalPrice } = req.body;
    console.log(req.body);

    const order = await Order.findOne({ _id: orderId });

    for (const Data of order.items) {
      const product = await Product.findOne({ _id: Data.product_id });
      if (product.stockQuantity < Data.quantity) {
        res.json({ success: false });
        return console.log("there no limit quantity");
      }
    }

    const orders = await instance.orders.create({
      amount: totalPrice * 100,
      currency: "INR",
      receipt: "" + orderId,
    });

    return res.json({ success: true, orders });
  } catch (error) {}
};

const Verifypayment = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const Data = req.body;

    let hmac = crypto.createHmac("sha256", "szr5SFPPifbykQd7YtHKeZHr");
    hmac.update(Data.razorpay_order_id + "|" + Data.razorpay_payment_id);
    const hmacvalue = hmac.digest("hex");
    if (hmacvalue == Data.razorpay_signature) {
      console.log("working");
    }
    await Order.findByIdAndUpdate(Data.orders.receipt, {
      $set: { status: "Placed" },
    });
    // if (typeof referral !== 'undefined' && referral !== null) {
    //     const percentage = 5;
    //     const result = (percentage / 100) * TotalAmount;
    //     const user = await User.findOne({ referalcode: referral });
    //     if (user) {
    //       await User.findOneAndUpdate(
    //         { referalcode: referral },
    //         { $inc: { wallet: result.toFixed(0) } }
    //       );
    //     } else {
    //       console.log(" there is no user based this referral");
    //     }
    //   } else {
    //     console.log("there is no referral");
    //   }
    // const product = await Product.findOne({_id:Data.product_id})
    // if(product.stockQuantity <Data.quantity){
    //   return console.log("there no limit quantity")
    // }

    const order = await Order.findOne({ _id: Data.orders.receipt });

    for (const Data of order.items) {
      await Product.updateOne(
        { _id: Data.product_id },
        { $inc: { stockQuantity: -Data.quantity } }
      );
    }

    let ledger = await LedgerBook.findOne({ Order_id: Data.orders.receipt });
    if (!ledger) {
      ledger = new LedgerBook({
        Order_id: Data.orders.receipt,
        transactions: order.payment,
        balance: order.total_amount,
        debit: 0,
        date: new Date(),
        credit: order.total_amount,
      });
      await ledger.save();
    }

    res.json({ success: true, order: Data.orders.receipt });
  } catch (error) {
    console.log(error.message);
  }
};

const LoadCheckADDaddress = async (req, res) => {
  try {
    res.render("checkAddress");
  } catch (error) {
    console.log(error, message);
  }
};

const CheckADDaddress = async (req, res) => {
  try {
    const { name, mobile, pincode, address, city, landmark, state } = req.body;
    const id = req.session.user_id;
    console.log("id", id);
    const user = await User.findOne({ _id: id });
    console.log("user", user);

    if (!user) {
      res.redirect("/login");
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
    res.redirect("/checkout");
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const LoadConfirm = async (req, res) => {
  try {
    if (!req.session.user_id) {
      res.redirect("/login");
    } else {
      const { orderId } = req.query;
      const order = await Order.findOne({ _id: orderId });

      console.log("hii", order);
      const user = await User.findOne({ _id: req.session.user_id });
      if (order.items) {
        res.render("confirm", { order });
      } else {
        res.redirect("/home");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const LoadOrder = async (req, res) => {
  try {
    if (!req.session.user_id) {
      res.redirect("/login");
    } else {
      const id = req.session.user_id;

      const user = await User.findOne({ _id: id });
      const result = await Order.deleteMany({ status: "Pending" });
      console.log("ds", result);

      const order = await Order.find({});
      console.log("FGR", order);

      // console.log("hh", order);.

      res.render("order", { order });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const OrderView = async (req, res) => {
  try {
    if (!req.session.user_id) {
      res.redirect("/login");
    } else {
      const { orderId } = req.query;
      const order = await Order.findOne({ _id: orderId }).populate(
        "items.product_id"
      );

      console.log("hii", order);
      const user = await User.findOne({ _id: req.session.user_id });
      console.log("user:", user);

      const address = user.addresses.find(
        (address) =>
          address._id.toString() === order.delivery_address.toString()
      );
      console.log(address);
      res.render("orderview", { order, address });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const itemsCancel = async (req, res) => {
  try {
    const { CancelId, orderId } = req.body;
    const order = await Order.findOne({ _id: orderId });
    if (order) {
      const updatedItems = order.items.filter(
        (item) => item._id.toString() === CancelId.toString()
      );

      const newTotalAmount = order.total_amount - updatedItems[0].total_price;
      console.log("hello", updatedItems[0].total_price);
      await Order.updateOne(
        { _id: orderId, "items._id": CancelId },
        {
          $set: {
            "items.$.ordered_status": "Cancelled",
            total_amount: newTotalAmount,
          },
        }
      );
      let orderID = await Order.findOne({ _id: orderId });

      const hasPlacedItems = orderID.items.some(
        (item) => item.ordered_status === "Placed"
      );
      if (!hasPlacedItems) {
        await Order.updateOne(
          { _id: orderID },
          {
            $set: {
              status: "Cancelled",
              total_amount: 0,
            },
          }
        );
      }

      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const OrderCancel = async (req, res) => {
  try {
    const id = req.query.CancelId;
    console.log("fi", id);
    let order = await Order.findOne({ _id: id });

    if (
      (order && order.payment === "Cash-on-online") ||
      order.payment === "Cash-on-wallet"
    ) {
      const user = await User.findByIdAndUpdate(
        { _id: order.user_id },
        {
          $inc: { wallet: order.total_amount },
          $push: {
            wallet_history: {
              date: new Date(),
              amount: order.total_amount,
              description: "Cancelled",
              paymentMethod: order.payment,
            },
          },
        }
      );

      for (const data of order.items) {
        const product = await Product.findByIdAndUpdate(
          { _id: data.product_id },
          { $inc: { stockQuantity: data.quantity } }
        );
      }

      await Order.updateOne({ _id: id }, { $set: { status: "Cancelled" } });
      console.log("cancelled successfully");
    } else {
      for (const data of order.items) {
        const product = await Product.findByIdAndUpdate(
          { _id: data.product_id },
          { $inc: { stockQuantity: data.quantity } }
        );
      }
      await Order.updateOne({ _id: id }, { $set: { status: "Cancelled" } });
      console.log("cancelled successfully");
    }

    const ledgerBook = LedgerBook.findOne({ Order_id: order._id });
    if (ledgerBook) {
      const updatedDocument = await LedgerBook.findOneAndUpdate(
        { Order_id: order._id },
        { $set: { debit: order.total_amount }, credit: 0, balance: 0 },
        { new: true }
      );
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadCart,
  AddToCart,
  UpdateQuantity,
  deleteItems,
  LoadCheckout,
  Checkout,
  LoadCheckADDaddress,
  LoadConfirm,
  LoadOrder,
  OrderView,
  OrderCancel,
  CheckADDaddress,
  Verifypayment,
  PendingPay,
  itemsCancel,
};
