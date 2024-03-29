const User = require("../Models/userModel");
const { ObjectId, Transaction } = require("mongodb");
const Categories = require("../Models/categoriesModel");
const Order = require("../Models/OrderModel");
const bcrypt = require("bcryptjs");
const { response } = require("../Routes/user");
const Product = require("../Models/productModel");
const Offer = require("../Models/offerModel");
// const Legder = require("../Models/legdeModel");
const Ledgerbook = require("../Models/legdeModel");

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
    const orders = await Order.find({ status: "Delivered" });
    let ledge = await Ledgerbook.find({}).sort({ _id: -1 });

    for (const order of orders) {
      let ledger = await Ledgerbook.findOne({ Order_id: order._id });
      if (!ledger) {
        ledger = new Ledgerbook({
          Order_id: order._id,
          transactions: order.payment,
          balance: order.total_amount,
          debit: 0,
          date:new Date,
          credit: order.total_amount,
        });
        await ledger.save();
      }
      
    }

    const totalOrders = await Order.countDocuments({});
    // top selling product
    const topProduct = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product_id",
          productName: { $first: "$items.productName" },
          brand: { $first: "$items.brand" },
          category: { $first: "$items.category" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // top selling category
    const topCategory = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.category",
          category: { $first: "$items.category" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // top selling category
    const topBrand = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.brand",
          brand: { $first: "$items.brand" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

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

    // monthly total sales
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

    // monthly total user
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

    // monthly total orders
    const monthlyTotalOrders = await Order.aggregate([
      {
        $unwind: "$items",
      },
      {
        $match: {
          createdAt: { $gte: new Date(currentYear, currentMonth - 1, 1) },
        
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

    // total sales in year

    const yearlySalesData = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
          createdAt: { $gte: new Date(currentYear - yearsToInclude, 0, 1) },
        },
      },
      {
        $group: {
          _id: { $year: "$createdAt" },
          totalOrders: { $sum: 1 },
          totalSales: { $sum: "$total_amount" }, // Calculate total sales amount
        },
      },
    ]);
    // console.log("hello", yearlySalesData);
   
    const updatedYearlyValues = defaultYearlyValues.map((defaultYear) => {
      const foundYear = yearlySalesData.find(
        (yearData) => yearData._id === defaultYear.year
      );
      return foundYear || defaultYear;
    });

    // console.log("asdfwewwqqw", updatedYearlyValues);
    const yearlyTotalOrders = await Order.aggregate([
      {
        $match: {
          
          createdAt: { $gte: new Date(currentYear - yearsToInclude, 0, 1) },
        },
      },
      {
        $group: {
          _id: { $year: "$createdAt" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);
console.log(yearlyTotalOrders,"hello");
    // Update yearly total orders based on retrieved data
    const updatedYearlyTotalOrders = defaultYearlyValues.map((defaultYear) => {
      const foundYear = yearlyTotalOrders.find(
        (yearData) => yearData._id === defaultYear.year
      );
      return {
        year: defaultYear.year,
        totalOrders: foundYear ? foundYear.totalOrders : 0,
      };
    });
console.log(updatedYearlyTotalOrders,"hello2");
    const yearlyTotalUsers = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(currentYear - yearsToInclude, 0, 1) },
        },
      },
      {
        $group: {
          _id: { $year: "$createdAt" },
          totalUsers: { $sum: 1 },
        },
      },
    ]);

    // Update yearly total users based on retrieved data
    const updatedYearlyTotalUsers = defaultYearlyValues.map((defaultYear) => {
      const foundYear = yearlyTotalUsers.find(
        (yearData) => yearData._id === defaultYear.year
      );
      return {
        year: defaultYear.year,
        totalUsers: foundYear ? foundYear.totalUsers : 0,
      };
    });


    const EveryMonthlySalesData = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
          createdAt: { $gte: new Date(currentYear, 0, 1) },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: "$total_amount" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          total: "$total",
          count: "$count",
        },
      },
    ]);

    const EveryMonthlySales = defaultMonthlyValues.map((defaultMonth) => {
      const foundMonth =EveryMonthlySalesData.find(
        (monthData) => monthData.month === defaultMonth.month
      );
      return foundMonth || defaultMonth;
    });
   

    const EveryMonthlyUserData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(currentYear, 0, 1) },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalUsers: { $sum: 1 },
        },
      },
    ]);
    const EveryMonthlyTotalUsers = defaultMonthlyValues.map(
      (defaultMonth) => {
        const foundMonth =EveryMonthlyUserData.find(
          (monthData) => monthData._id === defaultMonth.month
        );
        return {
          month: defaultMonth.month,
          totalUsers: foundMonth ? foundMonth.totalUsers : 0,
        };
      }
    );
    console.log(EveryMonthlyTotalUsers,"hekko")

    const EveryMonthlyTotalOrders = await Order.aggregate([
      {
        $unwind: "$items",
      },
      {
        $match: {
          createdAt: { $gte: new Date(currentYear, 0, 1) },
        
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);


    const EveryMonthlyOrders = defaultMonthlyValues.map(
      (defaultMonth) => {
        const foundMonth =  EveryMonthlyTotalOrders.find(
          (monthData) => monthData._id === defaultMonth.month
        );
        return {
          month: defaultMonth.month,
          totalOrders: foundMonth ? foundMonth.totalOrders : 0,
        };
      }
    );


    console.log(EveryMonthlyOrders ,"hello")
    // console.log(updatedYearlyTotalOrders);
    res.render("Dashboard", {
      updatedMonthlyValues,
      updatedMonthlyTotalUsers,
      updatedMonthlyTotalOrders,
      updatedYearlyValues,
      updatedYearlyTotalOrders,
      updatedYearlyTotalUsers,
      topProduct,
      topCategory,
      topBrand,
      orders,
      totalOrders,
      ledge,
      EveryMonthlySales,
      EveryMonthlyTotalUsers,
      EveryMonthlyOrders,

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
    const userData = await User.find({ is_admin: 0, is_Verified: 1 }).sort({_id:-1});

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


// const toggleuser = async(req,res)=>{
//   try {
//     const userId= req.query.id;
//     const user= await User.findOne({_id:userId})
//   user.isBlocked=!user.isBlocked
//   await user.save()
    


//   } catch (error) {
//     console.log(error.message)
//   }
// }





// block and unblock end

// ----------------------------------------------------

// Categories

const LoadCategory = async (req, res) => {
  try {
    const Data = await Categories.find({}).populate("Offer").sort({_id:-1});

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
