const Cart = require("../Models/cartModel");
const Product = require("../Models/productModel");
const Category = require("../Models/categoriesModel");
const User = require("../Models/userModel");
// const Cart = require("../Models/cartModel");

const loadCart = async (req, res) => {
  try {
    let user;
    if (req.session.user_id) {
      console.log("userddf", req.session.user_id);
      id = req.session.user_id;
      user = await User.findOne({ _id: id });
      console.log("ue", user);
    }

    if (!user) {
      res.redirect("/login");
    }
    const cartDetails = await Cart.findOne({ user_id: id })
    console.log("df", cartDetails);
    const userData = await User.findOne({ _id: user._id });

    let originalAmount = 0;
    if (cartDetails) {
      cartDetails.items.forEach((cartItem) => {
        let itemTotalPrice = cartItem.total_price;
        originalAmount += itemTotalPrice;
      });
    }
    // console.log("cart", cartDetails);
    res.render("cart", { user: userData, cartDetails, originalAmount });
  } catch (error) {
    console.log(error.message);
  }
};

const AddToCart = async (req, res) => {
  try {
    const { productId, quantity, productPrice } = req.body;
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
          const newTotalQuantity =
            existProduct.quantity + parseInt(quantity, 10);
          if (newTotalQuantity > product.stockQuantity) {
            res.json({ success: false, message: "Exceeds available quantity" });
            return;
          }
          await Cart.findOneAndUpdate(
            { user_id: id, "items.product_id": productId },
            {
              $inc: {
                "items.$.quantity": parseInt(quantity, 10),
                "items.$.total_price":
                  parseInt(quantity, 10) * parseFloat(productPrice.replace(',', '')),
              },
            }
          );
        }else {
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

module.exports = {
  loadCart,
  AddToCart,
};
