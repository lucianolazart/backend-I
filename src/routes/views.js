import express from "express";
import mongoose from "mongoose";
import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";

const router = express.Router();


router.get("/", async(req, res)=> {
  try{
    const { limit = 4, page = 1, sort, query } = req.query;

    let filter = {};
    if (query) {
      filter = {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } },
          { code: { $regex: query, $options: 'i' } }
        ]
      };
    }

    const options = { 
      limit: parseInt(limit), 
      page: parseInt(page),
      lean: true
    };

    if (sort) {
      const sortOrder = sort.toLowerCase() === 'desc' ? -1 : 1;
      options.sort = { price: sortOrder };
    }

    const data = await Product.paginate(filter, options);
    const products = data.docs;
    delete data.docs;

    const links = [];
    for(let i = 1; i <= data.totalPages; i++){
      const linkParams = new URLSearchParams({ limit, page: i });
      if (query) linkParams.set('query', query);
      if (sort) linkParams.set('sort', sort);
      links.push({ 
        text: i, 
        link: `?${linkParams.toString()}`,
        active: i === data.page
      });
    }

    const prevLink = data.hasPrevPage 
      ? `?${new URLSearchParams({ ...req.query, page: data.prevPage }).toString()}`
      : null;
    
    const nextLink = data.hasNextPage 
      ? `?${new URLSearchParams({ ...req.query, page: data.nextPage }).toString()}`
      : null;

    res.render("home", { 
      products, 
      links,
      totalPages: data.totalPages,
      currentPage: data.page,
      hasPrevPage: data.hasPrevPage,
      hasNextPage: data.hasNextPage,
      prevPage: data.prevPage,
      nextPage: data.nextPage,
      prevLink,
      nextLink,
      query,
      sort,
      limit: parseInt(limit)
    });
  }catch(error){
    console.error("Error al cargar productos:", error);
    res.status(500).send({ message: error.message });
  }
});

router.get("/products/:pid", async (req, res) => {
  try {
    const pid = req.params.pid;
    
    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).render("error", {
        title: "ID inválido",
        message: "El ID del producto no es válido"
      });
    }
    
    const product = await Product.findById(pid).lean();
    
    if (!product) {
      return res.status(404).render("error", {
        title: "Producto no encontrado",
        message: "El producto que buscas no existe"
      });
    }

    res.render("product", {
      title: `${product.title} - Mi Tienda`,
      product: product
    });
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).render("error", {
      title: "Error",
      message: "Error al cargar el producto"
    });
  }
});

router.get("/carts/:cid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = await Cart.findById(cartId).populate("products.product").lean();
    
    if (!cart) {
      return res.status(404).render("error", {
        title: "Carrito no encontrado",
        message: "El carrito que buscas no existe"
      });
    }


    res.render("cart", {
      title: `Carrito - Mi Tienda`,
      cart: cart
    });
  } catch (error) {
    console.error("Error al obtener carrito:", error);
    res.status(500).render("error", {
      title: "Error",
      message: "Error al cargar el carrito"
    });
  }
});

router.get("/realtimeproducts", async (req, res) => {
  try {
    const products = await Product.find().lean();
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