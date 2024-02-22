

const mongoose = require("mongoose") ;



const categorySchema = new mongoose.Schema({

  name : String,
  description : String,
  isListed:{
    type:Boolean,
    default:true
  },
  Offer:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"offer",
  },
  


})
  
  module.exports= mongoose.model('Category', categorySchema);