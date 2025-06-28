import express from "express";
import ProductManager from "../managers/ProductManager.js";

const router = express.Router();
const productManager = new ProductManager("./src/data/products.json");

// Ruta para la página principal
router.get("/", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render("home", {
      title: "Inicio - Mi Tienda",
      products: products
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.render("home", {
      title: "Inicio - Mi Tienda",
      products: []
    });
  }
});

// Ruta para productos en tiempo real
router.get("/realtimeproducts", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render("realTimeProducts", {
      title: "Productos en Tiempo Real - Mi Tienda",
      products: products
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.render("realTimeProducts", {
      title: "Productos en Tiempo Real - Mi Tienda",
      products: []
    });
  }
});

export default router; 