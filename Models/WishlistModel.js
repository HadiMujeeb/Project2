const mongoose = require("mongoose")



const WishlistModel = new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },

   
    product: [{
       product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
    },
    }
],

})

const Wishlist = mongoose.model("Wishlist", WishlistModel)

module.exports = Wishlist;