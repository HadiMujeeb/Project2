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
    // brand:{
    //     type:String,
    //     required:true,
    // },
    is_Listed:{
        type:Boolean,
       default:true         
    },
   
})

module.exports= mongoose.model("product",productSchema)