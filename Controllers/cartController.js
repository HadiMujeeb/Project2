const Cart = require("../Models/cartModel");
const Product = require("../Models/productModel");
const Category = require("../Models/categoriesModel");
const User = require("../Models/userModel");
const ObjectId = require("mongoose").Types.ObjectId;
const Order = require("../Models/OrderModel");
const { now } = require("mongoose");

const loadCart = async (req, res) => {
  try {
    let user;
    if (req.session.user_id) {
      // console.log("userddf", req.session.user_id);
      id = req.session.user_id;
      user = await User.findOne({ _id: id });
      // console.log("ue", user);
    }

    if (!user) {
      res.redirect("/login");
    }
    const cartDetails = await Cart.findOne({ user_id: id }).populate({
      path: "items.product_id",
    });
    // console.log("df", cartDetails);
    const userData = await User.findOne({ _id: user._id });

    let originalAmount = 0;
    if (cartDetails) {
      cartDetails.items.forEach((cartItem) => {
        let itemTotalPrice = cartItem.total_price;
        originalAmount += itemTotalPrice;
      });
    }

    // console.log("iamdatails", cartDetails);
    // console.log("cart", cartDetails);
    res.render("cart", { user: userData, cartDetails, originalAmount });
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
      // console.log("ds", user);
    }

    if (!user) {
      res.json({ success: false, message: "User not logged in" });
      return;
    } else {
      const product = await Product.findOne({ _id: productId });
      // console.log("Product:", product);
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
            // console.log(product.stockQuantity,"hello");
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
    // console.log(count);

    const cart = await Cart.findOne({ user_id: req.session.user_id });
    // console.log('cart:',cart);

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
      if (
        cartProduct.quantity < 3 &&
        cartProduct.quantity < product.stockQuantity
      ) {
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
        // const maxAllowedQuantity = Math.min(product.stockQuantity);
        // console.log("maxqty:", maxAllowedQuantity);
        return res.json({
          success: false,
          message: "Were are sorry! Only 3 unit(s) allowed in each order.",
        });
      }
    } else if (count == -1) {
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
    if (cartUser.items.length == 1) {
      await Cart.deleteOne({ user_id: user });
    } else {
      await Cart.updateOne(
        { user_id: user },
        { $pull: { items: { _id: productId[1] } } }
      );
    }

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
      const { TotalPrice } = req.query;
      // console.log("total", TotalPrice);
      const id = req.session.user_id;

      const user = await User.findOne({ _id: id });

      const product = await Cart.findOne({ user_id: user }).populate(
        "items.product_id",
        "name"
      );

      res.render("ProceedCheckout", { user, TotalPrice, product });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const Checkout = async (req, res) => {
  try {
    // console.log("hiii", req.body);
    const { addressId, totalPrice, paymentMethod } = req.body;

    if (!req.session.user_id) {
      res.redirect("/login");
    } else {
      const id = req.session.user_id;
      const user = await User.findOne({ _id: id });
      const ProDetails = await Cart.findOne({ user_id: user }).populate(
        "items.product_id"
      );
      if (ProDetails) {
        const orderItems = ProDetails.items.map((item) => ({
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
          status: "none",
        });

        await order.save();
        console.log("Order placed successfully");
        if (order) {
          await Cart.deleteMany({});
          console.log("Items deleted from the cart");
          const order = await Order.findOne({ user_id: user._id }).sort({
            _id: -1,
          });
          console.log("orderid", order._id);
          res.json({ success: true, order: order._id });
        }
      }
    }
  } catch (error) {
    console.log(error.message);
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

      const address = user.addresses.find(
        (address) =>
          address._id.toString() === order.delivery_address.toString()
      );

      console.log("Address:", address);
      res.render("confirm", { order, address });
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

      const order = await Order.findOne({ user_id: user._id });

      //    const proIds = order.items.filter((item) => {
      //     return item.user_id.toString() === user._id.toString();
      // });
      console.log("hh", order);
      //  console.log("proID",proId);
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
      const order = await Order.findOne({ _id: orderId });
      console.log("hii", order);
      const user = await User.findOne({ _id: req.session.user_id });

      const address = user.addresses.find(
        (address) =>
          address._id.toString() === order.delivery_address.toString()
      );

      res.render("orderview", { order, address});
    }
  } catch (error) {
    console.log(error.message);
  }
};

const OrderCancel = async(req,res)=>{
  try {
    const id = req.query.CancelId;
    console.log("fi",id);
    const order = await Order.findOne({_id:id})
    if(order){
      await Order.updateOne({_id:id},{$set:{status:"cancelled"}})
      console.log("cancelled successfully");
    }

  } catch (error) {
    console.log(error.message);
  }
}


module.exports = {
  loadCart,
  AddToCart,
  UpdateQuantity,
  deleteItems,
  LoadCheckout,
  Checkout,
  LoadConfirm,
  LoadOrder,
  OrderView,
  OrderCancel
};
