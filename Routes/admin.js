const express = require("express");
const admin_router = express();
const adminController = require("../Controllers/adminController");
const productController = require("../Controllers/productController");
const couponController = require("../Controllers/CouponController");
const offerController = require("../Controllers/offerController")
const upload = require("../Middlewire/upload");

const  Auth= require("../Middlewire/adminAuth");
//view engine setup

admin_router.set("view engine", "ejs");
admin_router.set("views", "views/admin");

admin_router.use(express.json());
admin_router.use(express.urlencoded({ extended: true }));

// multer middle wire

admin_router.get("/admin", Auth.isLogout,adminController.loadLogin);

admin_router.post("/admin", adminController.verifyLogin);

admin_router.get("/dashboard", adminController.loadDashboard);

admin_router.get("/AdminLogout",adminController.logout)

admin_router.get("/User", adminController.loadUser);

// routes for blocking and unblocking
admin_router.get("/block", adminController.blockUser);

admin_router.get("/unblock", adminController.unblockUser);

// category
admin_router.get("/category", adminController.LoadCategory);

admin_router.get("/add", adminController.add_category);

// here we use get because i not render here i got a tag thats why

admin_router.get("/delete-Categories", adminController.deleteCategories);

admin_router.post("/addCategory", adminController.newCategories);

admin_router.get("/edit", adminController.LoadEditCategory);

admin_router.post("/edit", adminController.EditCategories);

admin_router.get("/List", adminController.List);

admin_router.get("/UnList", adminController.UnList);

admin_router.get("/product", productController.LoadProduct);

admin_router.get("/addproduct", productController.LoadAddProducts);

admin_router.post(
  "/addproduct",
  upload.array("image", 4),
  productController.addProduct
);

admin_router.get("/listProduct", productController.ListProduct);

admin_router.get("/unlistProduct", productController.unListProduct);

admin_router.get("/DeleteProduct", productController.DeleteProduct);

admin_router.get("/EditProduct", productController.loadEditProduct);

admin_router.post('/EditProduct',upload.array("image", 4),productController.EditProduct)

admin_router.patch('/deleteImage',productController.deleteIMG)




admin_router.get("/orderList", adminController.LoadOrderList);

admin_router.post("/orderList", adminController.OrderStatus); 

admin_router.get("/orderDetails", adminController.LoadOrderDetails);


admin_router.get("/loadCoupon",couponController.LoadCoupon);
   
admin_router.get("/addCoupon",couponController.LoadAddCoupon);

admin_router.post("/addCoupon",couponController.AddCoupon);

admin_router.get("/RemoveCoupon",couponController.RemoveCoupon);

admin_router.get("/loadOffer",offerController.LoadOffer);

admin_router.get("/loadAddOffer",offerController.loadAddOffer);

admin_router.post("/addOffer",offerController.addOffer);

admin_router.get("/RemoveOffer",offerController.RemoveOffer);

admin_router.patch("/addOffer",offerController.addOfferCategory);

admin_router.post( '/deleteOffer',offerController. deleteOffer);

admin_router.patch('/addOfferProduct',offerController.AddOfferProduct);

admin_router.post('/deleteOfferProduct',offerController.deleteOfferProduct);





module.exports = admin_router;
