import express from "express";
import mongoose from "mongoose";
import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";

const router = express.Router();

// router.get("/", async (req, res) => {
//   try {
//     const { limit = 4, page = 1, sort, query } = req.query;

//     let filter = {};
//     if (query) {
//       filter = {
//         $or: [
//           { category: { $regex: query, $options: 'i' } },
//           { status: query === 'true' ? true : query === 'false' ? false : undefined }
//         ].filter(condition => Object.values(condition)[0] !== undefined)
//       };
      
//       if (filter.$or.length === 0) {
//         filter = {
//           $or: [
//             { title: { $regex: query, $options: 'i' } },
//             { description: { $regex: query, $options: 'i' } }
//           ]
//         };
//       }
//     }

//     let sortOption = {};
//     if (sort === 'asc') {
//       sortOption = { price: 1 };
//     } else if (sort === 'desc') {
//       sortOption = { price: -1 };
//     }

//     const options = {
//       limit: parseInt(limit),
//       page: parseInt(page),
//       sort: sortOption,
//       lean: true
//     };

//     const data = await Product.paginate(filter, options);
//     const products = data.docs;

//     const baseUrl = req.protocol + '://' + req.get('host') + req.originalUrl.split('?')[0];
//     const queryParams = new URLSearchParams(req.query);
    
//     const links = [];
//     for(let i = 1; i <= data.totalPages; i++) {
//       const linkParams = new URLSearchParams(queryParams);
//       linkParams.set('page', i.toString());
//       links.push({ 
//         text: i, 
//         link: `${baseUrl}?${linkParams.toString()}`,
//         active: i === data.page
//       });
//     }

//     res.render("home", {
//       title: "Inicio - Mi Tienda",
//       products: products,
//       links: links,
//       currentPage: data.page,
//       totalPages: data.totalPages,
//       hasPrevPage: data.hasPrevPage,
//       hasNextPage: data.hasNextPage,
//       prevPage: data.prevPage,
//       nextPage: data.nextPage,
//       query: query || '',
//       sort: sort || ''
//     });
//   } catch (error) {
//     console.error("Error al obtener productos:", error);
//     res.status(500).send({ message: error.message });
//   }
// });

router.get("/", async(req, res)=> {
  try{
    const { limit = 4, page = 1 } = req.query;

    const data = await Product.paginate({}, { limit, page, lean: true });
    const products = data.docs;
    delete data.docs;

    const links = [];

    for(let i = 1 ; i <= data.totalPages; i++){
      links.push({ text: i, link: `?limit=${limit}&page=${i}` });
    }

    res.render("home", { products, links });
  }catch(error){
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
    console.log('cart', cart);
    console.log('cart.products', cart?.products);
    console.log('cart.products.length', cart?.products?.length);
    
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