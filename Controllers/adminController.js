const User = require("../Models/userModel");
const { ObjectId } = require("mongodb");
const Categories = require("../Models/categoriesModel");
const Order = require("../Models/OrderModel");
const bcrypt = require("bcrypt");
const { response } = require("../Routes/user");
const Product = require("../Models/productModel");
const Offer = require("../Models/offerModel");

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
          res.render("adminLogin", {
            messages: { message: "email and password is incorrect" },
          });
        } else {
          req.session.admin = userData._id;
          res.redirect("/dashboard");
        }
      } else {
        res.render("adminLogin", {
          messages: { message: "email and password is incorrect" },
        });
      }
    } else {
      res.render("adminLogin", {
        messages: { message: "email and password is incorrect" },
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//Dashboard

const loadDashboard = async (req, res) => {
  try {
    const yearsToInclude = 7;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const defaultMonthlyValues = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      total: 0,
      count: 0,
    }));

    const defaultYearlyValues = Array.from(
      { length: yearsToInclude },
      (_, i) => ({
        year: currentYear - yearsToInclude + i + 1,
        total: 0,
        count: 0,
      })
    );

    const monthlySalesData = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
          createdAt: { $gte: new Date(currentYear, currentMonth - 1, 1) },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: {
            $sum: "$total_amount",
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          total: "$total",
          count: "$count",
        },
      },
    ]);

    const updatedMonthlyValues = defaultMonthlyValues.map((defaultMonth) => {
      const foundMonth = monthlySalesData.find(
        (monthData) => monthData.month === defaultMonth.month
      );
      return foundMonth || defaultMonth;
    });
    const monthlyTotalUsers = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(currentYear, currentMonth - 1, 1) },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalUsers: { $sum: 1 },
        },
      },
    ]);
    const updatedMonthlyTotalUsers = defaultMonthlyValues.map(
      (defaultMonth) => {
        const foundMonth = monthlyTotalUsers.find(
          (monthData) => monthData._id === defaultMonth.month
        );
        return {
          month: defaultMonth.month,
          totalUsers: foundMonth ? foundMonth.totalUsers : 0,
        };
      }
    );

    const monthlyTotalOrders = await Order.aggregate([
      {
        $unwind: "$items",
      },
      {
        $match: {
          createdAt: { $gte: new Date(currentYear, currentMonth - 1, 1) },
          status: { $ne: "pending" },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);
    const updatedMonthlyTotalOrders = defaultMonthlyValues.map(
      (defaultMonth) => {
        const foundMonth = monthlyTotalOrders.find(
          (monthData) => monthData._id === defaultMonth.month
        );
        return {
          month: defaultMonth.month,
          totalOrders: foundMonth ? foundMonth.totalOrders : 0,
        };
      }
    );

    const yearlySalesData = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
          createdAt: { $gte: new Date(currentYear, yearsToInclude, 0, 1) },
        },
      },
      {
        $group: {
          _id: { $year: "$createdAt" },
          total: {
            $sum: "$total_amount",
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          total: "$total",
          count: "$count",
        },
      },
    ]);

    // Update yearly values based on retrieved data
    const updatedYearlyValues = defaultYearlyValues.map((defaultYear) => {
      const foundYear = yearlySalesData.find(
        (yearData) => yearData.year === defaultYear.year
      );
      return foundYear || defaultYear;
    });

    console.log(updatedMonthlyTotalOrders);
    res.render("Dashboard", {
      updatedMonthlyValues,
      updatedMonthlyTotalUsers,
      updatedMonthlyTotalOrders,
      updatedYearlyValues
    });
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
    const userData = await User.find({ is_admin: 0, is_Verified: 1 });

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
    const Data = await Categories.find({}).populate("Offer");

    const offerId = await Offer.find({
      startingDate: { $lte: new Date() },
      expiryDate: { $gte: new Date() },
    });
    res.render("Categories", { Data, offerId });
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
    const data = await Categories.findOne({ _id: req.query.id });

    res.render("Categoriesedit", { Data: data });
  } catch (error) {
    console.log(error.message);
  }
};

const EditCategories = async (req, res) => {
  try {
    const id = req.body.categoryId;
    console.log(id);
    const name = req.body.category_name.toUpperCase();
    const description = req.body.category_description.toUpperCase();

    console.log("iam body", req.body);

    const Data = await Categories.findOne({ name: name });

    console.log("darta", Data);
    if (Data) {
      return res.render("Categoriesedit", {
        messages: { message: "Categories already exist" },
        Data: Data,
      });
    } else {
      const UpdateCategories = await Categories.updateOne(
        { _id: id },
        { $set: { name: name, description: description } }
      );

      res.redirect("/category");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const List = async (req, res) => {
  try {
    console.log(req.query.id);
    await Categories.updateOne(
      { _id: req.query.id },
      { $set: { isListed: true } }
    );
    res.redirect("/category");
  } catch (error) {
    console.log(error.message);
  }
};

const UnList = async (req, res) => {
  try {
    console.log(req.query.id);
    await Categories.updateOne(
      { _id: req.query.id },
      { $set: { isListed: false } }
    );
    console.log("set", req.query.id);
    res.redirect("/category");
  } catch (error) {
    console.log(error.message);
  }
};

const LoadOrderList = async (req, res) => {
  try {
    if (!req.session.admin) {
      res.redirect("/admin");
    } else {
      const order = await Order.find({}).sort({
        createdAt: -1,
      });
      res.render("orderList", { order });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const OrderStatus = async (req, res) => {
  try {
    const { status, orderId } = req.body;

    console.log("Status:", status, "jjdf", orderId);
    if (status && orderId) {
      const order = await Order.updateOne(
        { _id: orderId },
        { $set: { status: status } }
      );

      res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        order: order,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Missing status or orderId in the request",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const LoadOrderDetails = async (req, res) => {
  try {
    if (!req.session.admin) {
      res.redirect("/admin");
    } else {
      const orderId = req.query.ORid;
      console.log("qq", orderId);
      const order = await Order.findOne({ _id: orderId }).populate(
        "items.product_id"
      );

      const user = await User.findOne({ _id: order.user_id });
      const address = user.addresses.find(
        (address) =>
          address._id.toString() === order.delivery_address.toString()
      );

      res.render("orderDetails", { user, order, address });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const salesReport = async (req, res) => {
  try {
    if (!req.session.admin) {
      res.redirect("/admin");
    } else {
      const { reportType } = req.body;
      console.log("redfv", reportType);
      const sales = await Order.find({ status: "Delivered" });
      // console.log('hii',sales)
      res.render("salesReport", { sales });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const CustomDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const fromDate = new Date(startDate);
    const toDate = new Date(endDate);
    toDate.setHours(23, 59, 59, 999);
    const sales = await Order.find({
      date: { $gte: fromDate, $lte: toDate },
      status: "Delivered",
    });
    console.log(sales, "dfge");
    console.log("hiiii");
    res.render("salesReport", { sales });
  } catch (error) {
    console.log(error.message);
  }
};
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
  LoadOrderList,
  OrderStatus,
  LoadOrderDetails,
  salesReport,
  CustomDate,
};
