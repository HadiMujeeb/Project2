const Product = require("../Models/productModel");
const Category = require("../Models/categoriesModel");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { log } = require("util");
const { default: mongoose } = require("mongoose");

const LoadProduct = async (req, res) => {
  try {
    const products = await Product.find({}).populate("category");
    res.render("productList", { products: products });
  } catch (error) {
    console.log(error.message);
  }
};

const LoadAddProducts = async (req, res) => {
  try {
    const Categories = await Category.find({ isListed: true });
    res.render("productadd", { Category: Categories });
  } catch (error) {
    console.log(error.message);
  }
};

const addProduct = async (req, res) => {
  try {
    const Categories = await Category.find({ isListed: true });

    const existProduct = await Product.findOne({
      name: req.body.productName,
    });
    console.log(req.body.productName);

    if (existProduct) {
      res.render("productadd", {
        message: "product already exist",
        Category: Categories,
      });
    } else {
      const {
        productName,
        description,
        Quantity,
        price,
        category,
        brand,
        date,
      } = req.body;
      console.log(req.body);
      console.log(category);
      const filenames = [];

      //   console.log("dwiundwiudwnui");

      const selectedCategory = await Category.findOne({ name: category });

      const data = await Category.findOne({ isListed: true });

      if (req.files.length !== 4) {
        return res.render("addProduct", {
          message: " 4 images needed",
          Category: data,
        });
      }

      console.log(req.files);
      for (let i = 0; i < req.files.length; i++) {
        const imagesPath = path.join(
          __dirname,
          "../public/SharpImage",
          req.files[i].filename
        );
        await sharp(req.files[i].path)
          .resize(800, 1200, { fit: "fill" })
          .toFile(imagesPath);
        filenames.push(req.files[i].filename);
      }

      const newProduct = new Product({
        name: productName,
        description,
        stockQuantity: Quantity,
        price,
        image: filenames,
        category: selectedCategory._id,
        brand,
        date: new Date(),
      });

      console.log(filenames);

      await newProduct.save();
      res.redirect("/product");
    }
  } catch (error) {
    console.log(error);
  }
};

const ListProduct = async (req, res) => {
  try {
    console.log(req.query.id);
    await Product.updateOne(
      { _id: req.query.id },
      { $set: { is_Listed: true } }
    );
    res.redirect("/product");
  } catch (error) {
    console.log(error.message);
  }
};

const unListProduct = async (req, res) => {
  try {
    console.log(req.query.id);
    await Product.updateOne(
      { _id: req.query.id },
      { $set: { is_Listed: false } }
    );
    res.redirect("/product");
  } catch (error) {
    console.log(error.message);
  }
};

const DeleteProduct = async (req, res) => {
  try {
    const id = req.query.id;

    console.log(id);

    await Product.deleteOne({ _id: id });
    res.redirect("/product");
  } catch (error) {
    console.log(error.message);
  }
};

const loadEditProduct = async (req, res) => {
  try {
    const data = await Product.findOne({ _id: req.query.id });
    // console.log("hello",data);
    const Categories = await Category.find({ isListed: true });
    res.render("EditProduct", { Category: Categories, Data: data });
  } catch (error) {
    console.log(error.message);
  }
};

const EditProduct = async (req, res) => {
  try {
    console.log("hii");
    const id = req.body.id;
    console.log("id", id);

    const {
      productName,
      description,
      Quantity,
      price,
      category,
      brand,
    } = req.body;
    console.log(req.body);

    const images = req.files.map((file) => file.buffer.toString("base64"));
    const catego = await Category.findOne({ name: category });
    await Product.updateOne(
      { _id: id },
      {
        $set: {
          name: productName,
          description,
          price,
          category: catego._id,
          stockQuantity: Quantity,
          brand,
          image: images,
        },
      }
    );

    res.redirect("/product");
  } catch (error) {
    console.log(error.message);
  }
};

const deleteIMG = async (req, res) => {
  try {
    const { image, prdtId, index } = req.body;
    console.log(req.body);
    fs.unlink(path.join(__dirname, "../public/SharpImage", image), () => {});
    await Product.updateOne({ _id: prdtId }, { $pull: { image: image } });
    res.send({ success: true });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  LoadProduct,
  LoadAddProducts,
  addProduct,
  unListProduct,
  ListProduct,
  DeleteProduct,
  loadEditProduct,
  EditProduct,
  deleteIMG,
};
