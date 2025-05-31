import fs from "fs";

class CartManager {
    constructor(pathFile) {
        this.pathFile = pathFile;
    }

    async getCarts() {
        try {
            const fileData = await fs.promises.readFile(this.pathFile, "utf-8");
            const carts = JSON.parse(fileData);
            return carts;
        } catch (error) {
            throw new Error("Error al traer los carritos - " + error.message);
        }
    }

    generateNewId(carts) {
        if (carts.length > 0) {
            return carts[carts.length - 1].id + 1;
        } else {
            return 1;
        }
    }

    async createCart() {
        try {
            const fileData = await fs.promises.readFile(this.pathFile, "utf-8");
            const carts = JSON.parse(fileData);

            const newCart = {
                id: this.generateNewId(carts),
                products: []
            };

            carts.push(newCart);
            await fs.promises.writeFile(this.pathFile, JSON.stringify(carts, null, 2), "utf-8");
            return newCart;
        } catch (error) {
            throw new Error("Error al crear el carrito - " + error.message);
        }
    }

    async getCartById(cartId) {
        try {
            const fileData = await fs.promises.readFile(this.pathFile, "utf-8");
            const carts = JSON.parse(fileData);
            const cart = carts.find(cart => cart.id === parseInt(cartId));

            if (!cart) {
                throw new Error(`Carrito con id: ${cartId} no encontrado`);
            }

            return cart;
        } catch (error) {
            throw new Error(`Error al obtener el carrito: ${error.message}`);
        }
    }

    async addProductToCart(cartId, productId) {
        try {
            const fileData = await fs.promises.readFile(this.pathFile, "utf-8");
            const carts = JSON.parse(fileData);
            const cartIndex = carts.findIndex(cart => cart.id === parseInt(cartId));

            if (cartIndex === -1) {
                throw new Error(`Carrito con id: ${cartId} no encontrado`);
            }

            const productInCart = carts[cartIndex].products.find(prod => prod.product === parseInt(productId));

            if (productInCart) {
                productInCart.quantity += 1;
            } else {
                carts[cartIndex].products.push({
                    product: parseInt(productId),
                    quantity: 1
                });
            }

            await fs.promises.writeFile(this.pathFile, JSON.stringify(carts, null, 2), "utf-8");
            return carts[cartIndex];
        } catch (error) {
            throw new Error(`Error al agregar producto al carrito: ${error.message}`);
        }
    }
}

export default CartManager; 