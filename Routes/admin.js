const express = require("express");
const admin_router = express();
const adminController = require("../Controllers/adminController");
const productController = require("../Controllers/productController");
const couponController = require("../Controllers/CouponController");
const offerController = require("../Controllers/offerController");
const upload = require("../Middlewire/upload");

const Auth = require("../Middlewire/adminAuth");
//view engine setup

admin_router.set("view engine", "ejs");
admin_router.set("views", "views/admin");

admin_router.use(express.json());
admin_router.use(express.urlencoded({ extended: true }));

// multer middle wire

admin_router.get("/admin", adminController.loadLogin);

admin_router.post("/admin", adminController.verifyLogin);

admin_router.get("/dashboard", Auth.isLogout, adminController.loadDashboard);

admin_router.get("/AdminLogout", adminController.logout);

admin_router.get("/User", Auth.isLogout, adminController.loadUser);

// routes for blocking and unblocking
admin_router.get("/block", Auth.isLogout, adminController.blockUser);

admin_router.get("/unblock", Auth.isLogout, adminController.unblockUser);

// category
admin_router.get("/category", Auth.isLogout, adminController.LoadCategory);

admin_router.get("/add", Auth.isLogout, adminController.add_category);

// here we use get because i not render here i got a tag thats why

admin_router.get(
  "/delete-Categories",
  Auth.isLogout,
  adminController.deleteCategories
);

admin_router.post("/addCategory", adminController.newCategories);

admin_router.get("/edit", Auth.isLogout, adminController.LoadEditCategory);

admin_router.post("/edit", adminController.EditCategories);

admin_router.get("/List", Auth.isLogout, adminController.List);

admin_router.get("/UnList", adminController.UnList);

admin_router.get("/product", Auth.isLogout, productController.LoadProduct);

admin_router.get(
  "/addproduct",
  Auth.isLogout,
  productController.LoadAddProducts
);

admin_router.post(
  "/addproduct",
  upload.array("image", 4),
  productController.addProduct
);

admin_router.get("/listProduct", Auth.isLogout, productController.ListProduct);

admin_router.get("/unlistProduct", productController.unListProduct);

admin_router.get("/DeleteProduct", productController.DeleteProduct);

admin_router.get(
  "/EditProduct",
  Auth.isLogout,
  productController.loadEditProduct
);

admin_router.post(
  "/EditProduct",
  upload.array("image", 4),
  productController.EditProduct
);

admin_router.patch("/deleteImage", productController.deleteIMG);

admin_router.get("/orderList", Auth.isLogout, adminController.LoadOrderList);

admin_router.post("/orderList", adminController.OrderStatus);

admin_router.get(
  "/orderDetails",
  Auth.isLogout,
  adminController.LoadOrderDetails
);

admin_router.get("/loadCoupon", Auth.isLogout, couponController.LoadCoupon);

admin_router.get("/addCoupon", Auth.isLogout, couponController.LoadAddCoupon);

admin_router.post("/addCoupon", couponController.AddCoupon);

admin_router.get("/RemoveCoupon", couponController.RemoveCoupon);

admin_router.get("/loadOffer", Auth.isLogout, offerController.LoadOffer);

admin_router.get("/loadAddOffer", Auth.isLogout, offerController.loadAddOffer);

admin_router.post("/addOffer", offerController.addOffer);

admin_router.get("/RemoveOffer", offerController.RemoveOffer);

admin_router.patch("/addOffer", offerController.addOfferCategory);

admin_router.post("/deleteOffer", offerController.deleteOffer);

admin_router.patch("/addOfferProduct", offerController.AddOfferProduct);

admin_router.post("/deleteOfferProduct", offerController.deleteOfferProduct);

admin_router.get("/saleReport",Auth.isLogout, adminController.salesReport);

admin_router.post("/customDate", adminController.CustomDate);

module.exports = admin_router;
