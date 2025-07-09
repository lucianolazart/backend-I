import express from "express";
import Cart from "../models/cart.model.js";

const cartRouter = express.Router();

cartRouter.post("/", async(req, res) => {
  try {
    const cart = new Cart();
    await cart.save();
    res.status(201).json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

cartRouter.get("/open", async(req, res) => {
  try {
    const openCarts = await Cart.find({ closed: false }).populate("products.product").lean();
    
    res.status(200).json({ 
      status: "success", 
      payload: openCarts,
      count: openCarts.length 
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

cartRouter.get("/:cid", async(req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = await Cart.findById(cartId).populate("products.product").lean();

    if(!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
    
    if(cart.closed) return res.status(404).json({ status: "error", message: "Carrito cerrado" });

    res.status(200).json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

cartRouter.post("/:cid/product/:pid", async(req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    
    const cart = await Cart.findById(cid);
    if(!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

    // Buscar si el producto ya existe en el carrito
    const existingProduct = cart.products.find(p => p.product.toString() === pid);
    
    if (existingProduct) {
      // Si el producto ya existe, sumar la cantidad
      existingProduct.quantity += quantity || 1;
    } else {
      // Si el producto no existe, agregarlo nuevo
      cart.products.push({ product: pid, quantity: quantity || 1 });
    }
    
    await cart.save();
    const updatedCart = await Cart.findById(cid).populate("products.product");

    res.status(201).json({ status: "success", payload: updatedCart });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

cartRouter.delete("/:cid/products/:pid", async(req, res) => {
  try {
    const { cid: cartId, pid: productId } = req.params;
    
    const cart = await Cart.findById(cartId);
    if(!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

    cart.products = cart.products.filter(p => p.product.toString() !== productId);
    await cart.save();
    
    const populatedCart = await Cart.findById(cartId).populate("products.product");

    res.status(200).json({ status: "success", payload: populatedCart });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

cartRouter.delete("/:cid", async(req, res) => {
  try {
    const cartId = req.params.cid;
    
    const cart = await Cart.findById(cartId);
    if(!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

    cart.products = [];
    await cart.save();
    
    res.status(200).json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

cartRouter.put("/:cid/close", async(req, res) => {
  try {
    const cartId = req.params.cid;
    
    const cart = await Cart.findById(cartId);
    if(!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
    
    if(cart.closed) return res.status(400).json({ status: "error", message: "El carrito ya está cerrado" });

    cart.closed = true;
    await cart.save();
    
    const populatedCart = await Cart.findById(cartId).populate("products.product");
    
    res.status(200).json({ status: "success", payload: populatedCart });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

export default cartRouter;