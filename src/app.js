import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import ProductManager from "./managers/ProductManager.js";
import CartManager from "./managers/CartManager.js";
import viewsRouter from "./routes/views.js";
import productRouter from "./routes/product.router.js";
import cartRouter from "./routes/cart.router.js";
import { connectMongoDB } from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = process.env.PORT;

connectMongoDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

const productManager = new ProductManager("./src/data/products.json");
const cartManager = new CartManager("./src/data/carts.json");

// Configuración de Socket.IO
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });

  // Escuchar eventos de productos
  socket.on("productAdded", (products) => {
    socket.broadcast.emit("productsUpdated", products);
  });

  socket.on("productDeleted", (products) => {
    socket.broadcast.emit("productsUpdated", products);
  });
});

// Rutas de vistas
app.use("/", viewsRouter);
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);

// ---- PRODUCTOS API ----

// app.get("/api/products", async(req, res) => {
//   try {
//     const products = await productManager.getProducts();
//     res.status(200).json({ status: "success", products });
//   } catch (error) {
//     res.status(500).json({ status: "error" });
//   }
// });

// app.get("/api/products/:pid", async(req, res) => {
//   try {
//     const productId = req.params.pid;
//     const product = await productManager.getProductById(productId);
//     res.status(200).json({ status: "success", product });
//   } catch (error) {
//     res.status(404).json({ status: "error", message: error.message });
//   }
// });

// app.post("/api/products", async(req, res) => {
//   try {
//     const newProduct = req.body;
//     const products = await productManager.addProduct(newProduct);
    
//     io.emit("productsUpdated", products);
    
//     res.status(201).json({ status: "success", products });
//   } catch (error) {
//     res.status(400).json({ status: "error", message: error.message });
//   }
// });

// app.delete("/api/products/:pid", async(req, res) => {
//   try {
//     const productId = req.params.pid;
//     const products = await productManager.deleteProductById(productId);
    
//     io.emit("productsUpdated", products);
    
//     res.status(200).json({ status: "success", products });
//   } catch (error) {
//     res.status(404).json({ status: "error", message: error.message });
//   }
// });

// app.put("/api/products/:pid", async(req, res) => {
//   try {
//     const productId = req.params.pid;
//     const updatedData = req.body;
//     const products = await productManager.updateProductById(productId, updatedData);
//     res.status(200).json({ status: "success", products });
//   } catch (error) {
//     res.status(404).json({ status: "error", message: error.message });
//   }
// });

// ---- CARRITOS API ----

// app.post("/api/carts", async(req, res) => {
//   try {
//     const newCart = await cartManager.createCart();
//     res.status(201).json({ status: "success", cart: newCart });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: error.message });
//   }
// });

// app.get("/api/carts/:cid", async(req, res) => {
//   try {
//     const cartId = req.params.cid;
//     const cart = await cartManager.getCartById(cartId);
//     res.status(200).json({ status: "success", cart });
//   } catch (error) {
//     res.status(404).json({ status: "error", message: error.message });
//   }
// });

// app.post("/api/carts/:cid/product/:pid", async(req, res) => {
//   try {
//     const { cid: cartId, pid: productId } = req.params;
//     const updatedCart = await cartManager.addProductToCart(cartId, productId);
//     res.status(200).json({ status: "success", cart: updatedCart });
//   } catch (error) {
//     res.status(404).json({ status: "error", message: error.message });
//   }
// });

server.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
}); 