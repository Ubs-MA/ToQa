const mongoose=require("mongoose");

const productVariantSchema= new mongoose.Schema({
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product",
        required:true
    },
    size:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"ProductVariantSize",
        required:true
    },
    color:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"ProductVariantColor",
        required:true
    },
    sku:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    price:{
        type:Number,
        required:true,
        min:0
    },
    stock:{
        type:Number,
        required:true,
        min:0,
        default:0
    },
    isActive:{
        type:Boolean,
        default:true
    }
},{ timestamps:true});

module.exports= mongoose.model("ProductVariant",productVariantSchema);
