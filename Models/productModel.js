const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

    name:{
        type : String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    category:{
        type:mongoose.Types.ObjectId,
        ref :"Category",
        required:true,
    },
    image:{
    type:[],
    required:true,
    },
    stockQuantity:{
        type:Number,
        required : true,
    },
    date:{
        type: String,
        default: Date.now(),
    },
    is_Listed:{
        type:Boolean,
       default:true         
    },
    Offer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"offer",
      },
   
})

module.exports= mongoose.model("product",productSchema)