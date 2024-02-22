const Offer = require("../Models/offerModel");
const Category = require("../Models/categoriesModel");
const Product = require("../Models/productModel")

const LoadOffer = async (req, res) => {
  try {
    const offer = await Offer.find({});
    res.render("offer", { offer });
  } catch (error) {
    console.log(error.message);
  }
};

const loadAddOffer = async (req, res) => {
  try {
    res.render("addOffer");
  } catch (error) {
    console.log(error.message);
  }
};

const addOffer = async (req, res) => {
  try {
    const { name, startingDate, discountAmount, expire } = req.body;
    console.log("body:", req.body);
    const offer = await Offer.findOne({ name: name });

    if (offer) {
      res.render("addOffer", { message: "this Offer already Exist" });
    } else {
      console.log("hii");
      const newOffer = new Offer({
        name: name,
        startingDate: startingDate,
        expiryDate: expire,
        percentage: discountAmount,
        status: "Active",
      });
      await newOffer.save();
      res.redirect("/loadOffer");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const RemoveOffer = async (req, res) => {
  try {
    if (req.session.admin) {
      const { offerId } = req.query;
      await Offer.deleteOne({ _id: offerId });
      res.redirect("/loadOffer");
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addOfferCategory = async (req, res) => {
  try {
    const { offerId, categoryId } = req.body;

    const addOffer = await Category.findByIdAndUpdate(
      { _id: categoryId },
      { $set: { Offer: offerId } }
    );

    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
  }
};


const AddOfferProduct = async (req, res) => {
  try {
    const { offerId, productId } = req.body;

    const addOffer = await Product.findByIdAndUpdate(
      { _id: productId },
      { $set: { Offer: offerId } }
    );

    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
  }
};

const deleteOffer = async (req, res) => {
  try {
    const { categoryId } = req.body;
    const offer = await Category.findByIdAndUpdate(
      categoryId,
      { $unset: { Offer: 1 } },
      { new: true }
    );
    res.json({ success: true });
  } catch (error) {}
};
const deleteOfferProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const offer = await Product.findByIdAndUpdate(
      productId,
      { $unset: { Offer: 1 } },
      { new: true }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting offer:', error);
    res.status(500).json({ success: false});
  }
};
module.exports = {
  LoadOffer,
  loadAddOffer,
  addOffer,
  RemoveOffer,
  addOfferCategory,
  deleteOffer,
  AddOfferProduct,
  deleteOfferProduct,
};
