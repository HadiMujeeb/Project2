const User = require("../Models/userModel");
const Order = require("../Models/OrderModel");
const Product = require("../Models/productModel");

const returnProduct = async (req, res) => {
  try {
    if (!req.session.user_id) {
      res.redirect("/login");
    } else {
      const { orderId } = req.body;
      console.log(orderId);
      const order = await Order.findById(orderId);
      if (order.user_id == req.session.user_id) {
        const user = await User.findByIdAndUpdate(
          { _id: order.user_id },
          {
            $inc: { wallet: order.total_amount },
            $push: {
              wallet_history: {
                date: new Date(),
                amount: order.total_amount,
                description: "Refunded",
                paymentMethod: order.payment,
              },
            },
          }
        );

        for (const data of order.items) {
          const product = await Product.findByIdAndUpdate(
            { _id: data.product_id },
            { $inc: { stockQuantity: data.quantity } }
          );
        }
        await Order.findByIdAndUpdate(orderId, {
          $set: { status: "Refunded" },
        });
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  returnProduct,
};
