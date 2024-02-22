const Cart = require("../Models/cartModel");
const Product = require("../Models/productModel");
const Category = require("../Models/categoriesModel");
const User = require("../Models/userModel");
const ObjectId = require("mongoose").Types.ObjectId;
const Order = require("../Models/OrderModel");
const { now } = require("mongoose");
const Coupon = require("../Models/CouponModel");

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
          { path: "category", populate: { path: "Offer" } }
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
    const { productId, quantity, productPrice, productName } = req.body;
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
          // const result = await Product.updateOne(
          //   { _id: productId },
          //   {
          //     $inc: {
          //       stockQuantity: -quantity,
          //     },
          //   }
          // );
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
                },
              },
            }
          );

          console.log("hiii");
          // await Product.updateOne(
          //   { _id: productId },
          //   {
          //     $inc: {
          //       stockQuantity: -quantity,
          //     },
          //   }
          // );
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
            },
          ],
        });

        await newCart.save();
        // await Product.updateOne(
        //   { _id: productId },
        //   {
        //     $inc: {
        //       stockQuantity: -quantity,
        //     },
        //   }
        // );
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
    console.log("body:", req.body);

    let user;
    console.log("cart session", req.session.user_id);
    if (req.session.user_id) {
      const id = req.session.user_id;
      user = await User.findOne({ _id: id });
    }

    const productId = req.body.productId;
    console.log(productId);
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
          // await Product.findByIdAndUpdate(
          //   { _id: productId },
          //   { $inc: { stockQuantity: -1 } }
          // );
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
      const TotalPrice = parseFloat(req.query.TotalPrice);

      const id = req.session.user_id;

      const user = await User.findOne({ _id: id });

      const product = await Cart.findOne({ user_id: user }).populate(
        "items.product_id",
        "name"
      );

      const coupon = await Coupon.aggregate([
        {
          $match: {
            minAmount: { $lte: TotalPrice },
          },
        },
      ]);
      console.log("hii", TotalPrice);
      console.log(coupon, "hii");
      if (product) {
        res.render("ProceedCheckout", {
          user,
          TotalPrice,
          product,
          id,
          coupon,
        });
      } else {
        res.redirect("/shop");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const Checkout = async (req, res) => {
  try {
    const { addressId, totalPrice, paymentMethod } = req.body;

    if (!req.session.user_id) {
      res.redirect("/login");
    } else {
      console.log("hii");

      const id = req.session.user_id;
      const user = await User.findOne({ _id: id });

      const cart = await Cart.findOne({ user_id: user }).populate(
        "items.product_id"
      );
      // if (!user || user.isBlocked==false) {

      //   return res.render("/login");
      // }
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

      if (cart) {
        const orderItems = cart.items.map((item) => ({
          product_id: item.product_id,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          total_price: item.total_price,
          ordered_status: "none",
          cancellationReason: "none",
        }));
        console.log("product", orderItems.ProductName);
        const order = new Order({
          user_id: user._id,
          payment: paymentMethod,
          delivery_address: addressId,
          user_name: user.name,
          total_amount: totalPrice,
          items: orderItems,
          date: new Date(),
          status: "Processing",
        });

        await order.save();
        console.log("Order placed successfully");
        if (order) {
          await Cart.deleteMany({});
          console.log("Items deleted from the cart");
          const order = await Order.findOne({ user_id: user._id });
          console.log("orderid", order._id);
          res.json({ success: true, order: order._id });
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const LoadCheckADDaddress = async (req, res) => {
  try {
    res.render("checkaddress");
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
      res.render("confirm", { order });
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

const OrderCancel = async (req, res) => {
  try {
    const id = req.query.CancelId;
    console.log("fi", id);
    const order = await Order.findOne({ _id: id });
    if (order) {
      await Order.updateOne({ _id: id }, { $set: { status: "Cancelled" } });
      console.log("cancelled successfully");
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
};
