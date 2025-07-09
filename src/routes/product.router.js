import express from "express";
import mongoose from "mongoose";
import Product from "../models/product.model.js";

const productsRouter = express.Router();

// productsRouter.get("/", async(req, res)=> {
//   try {
//     const { limit = 10, page = 1, sort, query } = req.query;
    
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

//     const result = await Product.paginate(filter, options);

//     const baseUrl = req.protocol + '://' + req.get('host') + req.originalUrl.split('?')[0];
//     const queryParams = new URLSearchParams(req.query);
    
//     const prevLink = result.hasPrevPage 
//       ? `${baseUrl}?${queryParams.toString().replace(/page=\d+/, `page=${result.prevPage}`)}`
//       : null;
    
//     const nextLink = result.hasNextPage 
//       ? `${baseUrl}?${queryParams.toString().replace(/page=\d+/, `page=${result.nextPage}`)}`
//       : null;

//     const response = {
//       status: "success",
//       payload: result.docs,
//       totalPages: result.totalPages,
//       prevPage: result.prevPage,
//       nextPage: result.nextPage,
//       page: result.page,
//       hasPrevPage: result.hasPrevPage,
//       hasNextPage: result.hasNextPage,
//       prevLink: prevLink,
//       nextLink: nextLink
//     };

//     res.status(200).json(response);
//   } catch (error) {
//     res.status(500).json({ status: "error", message: "Error al recuperar los productos" });
//   }
// });

productsRouter.get("/", async(req, res)=> {
  try {
    const { limit = 10, page = 1 } = req.query;

    const data = await Product.paginate({}, { limit, page });
    const products = data.docs;
    delete data.docs;

    res.status(200).json({ status: "sucess", payload: products, ...data });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error al recuperar los productos" })
  }
});

productsRouter.get("/:pid", async(req, res)=> {
  try {
    const pid = req.params.pid;
    
    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({ status: "error", message: "ID de producto inválido" });
    }
    
    const product = await Product.findById(pid);
    
    if(!product) return res.status(404).json({ status: "error", message: "Producto no encontrado" });

    res.status(200).json({ status: "success", payload: product });
  } catch (error) {
    console.error("API - Error al obtener producto:", error);
    res.status(500).json({ status: "error", message: "Error al recuperar el producto" });
  }
});

productsRouter.post("/", async(req, res)=> {
  try {
    const { title, description, code, price, stock, category, thumbnail } = req.body;

    const product = new Product({ 
      title, 
      description, 
      code, 
      price, 
      stock, 
      category, 
      thumbnail 
    });
    await product.save();

    const updatedProducts = await Product.find().lean();
    const io = req.app.get('io');
    if (io) {
      io.emit('productsUpdated', updatedProducts);
    }

    res.status(201).json({ status: "success", payload: product });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error al añadir un nuevo producto" });
  }
});

productsRouter.put("/:pid", async(req, res)=> {
  try {
    const pid = req.params.pid;
    const updateData = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(pid, updateData, { new: true, runValidators: true });
    if(!updatedProduct) return res.status(404).json({ status: "error", message: "Producto no encontrado" });

    res.status(200).json({ status: "success", payload: updatedProduct });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error al editar un producto" });
  }
});

productsRouter.delete("/:pid", async(req, res)=> {
  try {
    const pid = req.params.pid;

    const deletedProduct = await Product.findByIdAndDelete(pid);
    if(!deletedProduct) return res.status(404).json({ status: "error", message: "Producto no encontrado" });

    const updatedProducts = await Product.find().lean();
    const io = req.app.get('io');
    if (io) {
      io.emit('productsUpdated', updatedProducts);
    }

    res.status(200).json({ status: "success", payload: deletedProduct });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error al borrar un producto" });
  }
});

export default productsRouter;