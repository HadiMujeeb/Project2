const Wishlist = require("../Models/WishlistModel");
const Product = require("../Models/productModel");
const User = require("../Models/userModel");

const WishlistLoad = async (req, res) => {
  try {
    if (!req.session.user_id) {
      res.redirect("/");
    }
    const id = req.session.user_id;

    const wishlistItem = await Wishlist.findOne({ user_id: id }).populate(
      "product.product_id"
    );

    res.render("wishlist", { wishlistItem ,id});
  } catch (error) {
    console.log(error.message);
  }
};

const addWishlist = async (req, res) => {
  try {
    if (!req.session.user_id) {
      res.redirect("/");
    } else {
      const productId = req.body.productId;
      console.log("hii", productId);
      const userId = req.session.user_id;

      const wishlistProduct = await Wishlist.findOne({
        user_id: userId,
        "product.product_id": productId,
      });

      if (!wishlistProduct) {
        const data = {
          product_id: productId,
        };
        const wish = await Wishlist.findOneAndUpdate(
          { user_id: userId },
          { $addToSet: { product: data } },
          { upsert: true, new: true }
        );
        res.status(200).json({ success: true, message: 'Product added to wishlist' });
      } else {
        console.log("product already existed");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteWishlist = async (req, res) => {
  try {
    if (req.session.user_id) {
      const id = req.session.user_id;
      const productId = req.body.productId;
      console.log("hii", productId);

      await Wishlist.findOneAndUpdate(
        { user_id: id },
        { $pull: { product: { product_id: productId } } },
        { new: true }
      );
      res.status(200).json({ message: "Item deleted successfully" });
      // res.redirect("/")
    }
  } catch (error) {
    console.log(error.message);
  }
};  

module.exports = {
  WishlistLoad,
  addWishlist,
  deleteWishlist,
};
