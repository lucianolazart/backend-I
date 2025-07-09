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
import connectMongoDB  from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = process.env.PORT;

connectMongoDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", engine({
  helpers: {
    multiply: function(a, b) {
      return (a * b).toFixed(2);
    },
    calculateTotal: function(products) {
      if (!products || !Array.isArray(products)) return '0.00';
      const total = products.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity);
      }, 0);
      return total.toFixed(2);
    }
  }
}));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

const productManager = new ProductManager("./src/data/products.json");
const cartManager = new CartManager("./src/data/carts.json");

app.set('io', io);

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });

  socket.on("productAdded", (products) => {
    socket.broadcast.emit("productsUpdated", products);
  });

  socket.on("productDeleted", (products) => {
    socket.broadcast.emit("productsUpdated", products);
  });
});

app.use("/", viewsRouter);
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);

server.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
}); 