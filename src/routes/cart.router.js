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