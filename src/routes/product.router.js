import express from "express";
import mongoose from "mongoose";
import Product from "../models/product.model.js";

const productsRouter = express.Router();

productsRouter.get("/", async(req, res)=> {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

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

    const baseUrl = req.originalUrl.split('?')[0];
    const queryParams = new URLSearchParams(req.query);
    
    const prevLink = data.hasPrevPage 
      ? `${baseUrl}?${new URLSearchParams({ ...req.query, page: data.prevPage }).toString()}`
      : null;
    
    const nextLink = data.hasNextPage 
      ? `${baseUrl}?${new URLSearchParams({ ...req.query, page: data.nextPage }).toString()}`
      : null;

    res.status(200).json({
      status: "success",
      payload: products,
      totalPages: data.totalPages,
      prevPage: data.prevPage,
      nextPage: data.nextPage,
      page: data.page,
      hasPrevPage: data.hasPrevPage,
      hasNextPage: data.hasNextPage,
      prevLink: prevLink,
      nextLink: nextLink
    });
  } catch (error) {
    console.error("Error al recuperar productos:", error);
    res.status(500).json({ status: "error", message: "Error al recuperar los productos" });
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