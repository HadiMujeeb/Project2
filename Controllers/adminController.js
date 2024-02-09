const User = require("../Models/userModel");
const { ObjectId } = require('mongodb');
const Categories = require("../Models/categoriesModel");
// const ProductList = require("../Models/productModel")
const bcrypt = require("bcrypt");

// const { LoginPage } = require("./userController");

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const loadLogin = async (req, res) => {
  try {
    res.render("adminLogin");
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    console.log(req.body);

    const { email, password } = req.body;

    const userData = await User.findOne({ email: email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        if (userData.is_admin == 0) {
          res.render("adminLogin", {messages:{ message:"email and password is incorrect" }});
        } else {
          req.session.admin = userData._id;
          res.redirect("/dashboard");
        }
      } else {
        res.render("adminLogin", {
          messages:{ message:"email and password is incorrect" }
        });
      }
    } else {
      res.render("adminLogin", { messages:{ message:"email and password is incorrect" } });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//Dashboard

const loadDashboard = async (req, res) => {
  try {
    res.render("Dashboard");
  } catch (error) {
    console.log(error.message);
  }
};


const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    console.log(error);
  }
};

//User

const loadUser = async (req, res) => {
  try {
    const userData = await User.find({ is_admin: 0 });

    res.render("User", { users: userData });
  } catch (error) {
    console.log(error.message);
  }
};

//block and unblock start
const blockUser = async (req, res) => {
  try {
    const data = await User.updateOne(
      { _id: req.query.id },
      { $set: { isBlocked: false } }
    );

    res.redirect("/User");
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: "Internal Server Error" });
  }
};

const unblockUser = async (req, res) => {
  try {
    const data = await User.updateOne(
      { _id: req.query.id },
      { $set: { isBlocked: true } }
    );
    res.redirect("/User");
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: "Internal Server Error" });
  }
};

// block and unblock end

// ----------------------------------------------------

// Categories

const LoadCategory = async (req, res) => {
  try {
    const Data = await Categories.find({})
    res.render("Categories", { Data: Data });
  } catch (error) {
    console.log(error.message);
  }
};

// Categories add

const add_category = async (req, res) => {
  try {
    res.render("Categoriesadd");
  } catch (error) {
    console.log(error.message);
  }
};

const newCategories = async (req, res) => {
  try {
    console.log(req.body);
    const name = req.body.product_name.toUpperCase();
    const description = req.body.product_description.toUpperCase();

    const Category = await Categories.findOne({ name: name });

    if (Category) {
      return res.render("Categoriesadd", {
        messages: { message: "this Categories already existed" },
      });
    } else {
      const Data = new Categories({
        name: name,
        description: description,
      });

      const categoryData = await Data.save();
      res.redirect("/category");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteCategories = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id);
    await Categories.deleteOne({ _id: id });
    res.redirect("/category");
  } catch (error) {
    console.log(error.message);
  }
};

// Cetegory edit

const LoadEditCategory = async (req, res) => {
  try { 
    const data = await Categories.findOne({ _id:req.query.id});
    // console.log(data);
   res.render("Categoriesedit",{Data:data})
    
  }catch(error){
    console.log(error.message);
  }
}

const EditCategories = async (req, res) => {
  try {
    const id = req.body.categoryId
    console.log(id);
    const name = req.body.category_name.toUpperCase();
    const description = req.body.category_description.toUpperCase();
 
    console.log('iam body',req.body);
    // const objectId = new ObjectId(id);

    const Data = await Categories.findOne({ name: name});

    console.log('darta',Data);
    if (Data) {
      return res.render("Categoriesedit", {
        messages: { message: "Categories already exist" },Data:Data
      });
    } else {
      const UpdateCategories = await Categories.updateOne(
        { _id:id },
        { $set: { name: name, description: description } }
      );

      res.redirect("/category");
    }
  } catch (error) {
    console.log(error.message);
  }
};


const List = async (req,res)=>{
try{
  console.log(req.query.id);
  await Categories.updateOne({_id:req.query.id},{$set:{isListed:true}});
  res.redirect("/category")
}catch(error){
  console.log(error.message);
}
};


const UnList = async (req,res)=>{
  try{
    console.log(req.query.id);
    await Categories.updateOne({_id:req.query.id},{$set:{isListed:false}})
    console.log("set",req.query.id);
    res.redirect("/category")
  }catch(error){
    console.log(error.message);
  }
  };


const LoadOrderList = async(req,res)=>{
  try {
    res.render("orderList")
  } catch (error) {
    console.log(error.message);
  }
}

  

module.exports = {
  loadLogin,
  logout,
  verifyLogin,
  securePassword,
  loadDashboard,
  loadUser,
  blockUser,
  unblockUser,
  LoadCategory,
  newCategories,
  add_category,
  LoadEditCategory,
  deleteCategories,
  EditCategories,
  List,
  UnList,
  LoadOrderList ,
  
};
