import express from "express";
import ProductManager from "./managers/ProductManager.js";
import CartManager from "./managers/CartManager.js";

const app = express();

app.use(express.json());

const productManager = new ProductManager("./src/data/products.json");
const cartManager = new CartManager("./src/data/carts.json");

//GET - Obtener datos
app.get("/", (req, res) => {
  res.json({ status: "success", message: "Hola mundo" });
});

// ---- PRODUCTOS ----

app.get("/api/products", async(req, res) => {
  try {
    const products = await productManager.getProducts();
    res.status(200).json({ status: "success", products });
  } catch (error) {
    res.status(500).json({ status: "error" });
  }
});

app.get("/api/products/:pid", async(req, res) => {
  try {
    const productId = req.params.pid;
    const product = await productManager.getProductById(productId);
    res.status(200).json({ status: "success", product });
  } catch (error) {
    res.status(404).json({ status: "error", message: error.message });
  }
});

app.post("/api/products", async(req, res) => {
  try {
    const newProduct = req.body;
    const products = await productManager.addProduct(newProduct);
    res.status(201).json({ status: "success", products });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
});

app.delete("/api/products/:pid", async(req, res) => {
  try {
    const productId = req.params.pid;
    const products = await productManager.deleteProductById(productId);
    res.status(200).json({ status: "success", products });
  } catch (error) {
    res.status(404).json({ status: "error", message: error.message });
  }
});

app.put("/api/products/:pid", async(req, res) => {
  try {
    const productId = req.params.pid;
    const updatedData = req.body;
    const products = await productManager.updateProductById(productId, updatedData);
    res.status(200).json({ status: "success", products });
  } catch (error) {
    res.status(404).json({ status: "error", message: error.message });
  }
});

// ---- CARRITOS ----

app.post("/api/carts", async(req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json({ status: "success", cart: newCart });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.get("/api/carts/:cid", async(req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = await cartManager.getCartById(cartId);
    res.status(200).json({ status: "success", cart });
  } catch (error) {
    res.status(404).json({ status: "error", message: error.message });
  }
});

app.post("/api/carts/:cid/product/:pid", async(req, res) => {
  try {
    const { cid: cartId, pid: productId } = req.params;
    const updatedCart = await cartManager.addProductToCart(cartId, productId);
    res.status(200).json({ status: "success", cart: updatedCart });
  } catch (error) {
    res.status(404).json({ status: "error", message: error.message });
  }
});

app.listen(8080, () => {
  console.log("Servidor iniciado en el puerto 8080");
}); 