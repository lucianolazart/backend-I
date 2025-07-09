import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  category: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: ''
  },
  status: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

productSchema.plugin(mongoosePaginate);

const Product = mongoose.model("Product", productSchema);

export default Product;