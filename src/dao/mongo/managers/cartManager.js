import mongoose from 'mongoose';

import config from '../../../config.js';
import cartModel from '../models/carts.js';
import productModel from '../models/products.js';
import LoggerService from '../../../services/LoggerService.js';


const logger = new LoggerService(config.logger.type);
export default class CartManager {
  //Obtiene todos los carts
  getCartBy = async (params) => {
    const populatedCart = await cartModel
      .findById(params)
      .populate('products.product')
      .lean();

    // Calcula la cantidad que hay de cada producto en el carrito
    const cartWithQuantity = populatedCart.products.map((productEntry) => {
      const quantity = productEntry.quantity || 1;
      const product = productEntry.product;
      return {
        product,
        quantity,
      };
    });

    populatedCart.products = cartWithQuantity;
    //logger.logger.info(JSON.stringify(populatedCart, null, '\t'));
    return populatedCart;
  };

  //Obtiene un Cart por ID
  getCartById = async (params) => {
    const populatedCart = await cartModel.findById(params).populate('products.product').lean();
    //logger.logger.info(JSON.stringify(populatedCart, null, '\t'));
    return populatedCart
  };

  //Crea un carrito
  createCart = async (products) => {
    try {
      console.log(products)
      const cart = new cartModel();
      const productIds = products.map(product => product._id);
      const productsToAdd = await productModel.find({ _id: { $in: productIds } });

      for (const product of productsToAdd) {
        const matchingProduct = products.find(p => p._id.toString() === product._id.toString());
        if (matchingProduct) {
          cart.products.push({ product: product._id, quantity: matchingProduct.qty });
        }
      }
      await cart.save();
      return cart;
    } catch (error) {
      throw new Error('Failed to create the cart');
    }
  };

  //Actualiza los productos del cart con el POST y los agrega al CART
  updateQtyCart = async (cid, pid, quantity) => {
    try {
      //Busco el carrito
      const cart = await cartModel.findById(cid);
      logger.logger.info('el cart', cart);
      //Si no existe el carrito
      if (!cart) {
        throw new Error(`The ID cart: ${cid} not found`);
      }
      //Busco el producto
      const product = await productModel.findById(pid);
      //Si el producto existe:
      if (product) {
        const existingProduct = cart.products.find(p => p.product.equals(product._id));
        logger.logger.info('elexistingproduct', existingProduct);
        //Si existe en el cart y la cantidad total no excede al stock
        if (existingProduct) {
          existingProduct.quantity += quantity;
        }
        //Si no existe en el cart lo agrego
        if (!existingProduct) {
          const newProduct = { product: product._id, quantity: 1 };
          cart.products.push(newProduct);
          logger.logger.info('Added product:', newProduct);
        }
      }
      await cart.save();
      return cart;
    } catch (error) {
      logger.logger.error('Error:', error);
      throw new Error('Failed to update the cart');
    }
  };

  //Actualiza aca toque cartID
  updateProductsInCart = async (cid, products) => {
    try {
      const cart = await cartModel.findById(cid).populate('products.product');
      // Si no encuentra el carrito
      if (!cart) {
        return null;
      }
      products.forEach(async (product) => {
        const productId = product.pid;
        logger.logger.info(productId);
        logger.logger.info('elcart', cart);
        //Busco el product en el cart
        const cartProduct = cart.products.find((cartProduct) => cartProduct.product._id.toString() === productId);
        logger.logger.debug('estaono', cartProduct);

        if (cartProduct) {
          //Si tiene cantidad le hago un update de la misma sino mantengo la que ya tengo
          if (product.quantity !== undefined) {
            cartProduct.quantity = product.quantity;
            logger.logger.info(`Updated quantity:`, product.quantity);
          }
          //Para el resto de los Fields
          const updateFields = ['title', 'description', 'code', 'price', 'status', 'stock', 'category', 'thumbnails'];
          updateFields.forEach((field) => {
            if (product[field] !== undefined) {
              cartProduct.product[field] = product[field];
              logger.logger.info(`Updated ${field}:`, product[field]);
            }
          });
        }
      });
      await cart.save();
      return cart;

    } catch (error) {
      console.log(error);
    }
  };

  //Actualiza la cantidad en un cart
  updateCart = async (cid, pid, qty) => {
    try {
      const cart = await cartModel.findById(cid).populate('products.product');
      logger.logger.info('cartt', cart);
      const productIndex = cart.products.findIndex((p) => p.product._id.equals(pid));

      if (productIndex !== -1) {
        //Si la nueva cantidad  es mayor al stock del producto. Arrojo error
        if (qty > cart.products[productIndex].product.stock) {
          throw {
            message: 'There is not enough stock',
            statusCode: 400,
          };
        }
        cart.products[productIndex].quantity = qty;
        await cart.save();
        return cart.products[productIndex].product;
      } else {
        throw new Error('Product not found in cart');
      }

    } catch (error) {
      throw error;
    }
  }

  //Elimina el carrito. No lo estoy usando
  deleteCart = async (cid) => {
    return cartModel.findByIdAndDelete(cid)
  }

  //Borra el producto del carrito
  deleteProductInCart = async (cid, productIdToDelete) => {
    try {
      const cart = await cartModel.findById(cid);
      if (!cart) {
        throw new Error('Cart not found');
      }
      logger.logger.info('id', productIdToDelete);
      const productIdsInCart = cart.products.map(item => item.product.toString());
      // Busco el index
      const productIndex = productIdsInCart.findIndex(id => id === productIdToDelete);
      //const productIndex = cart.products.findIndex(product => product.product.toString() === productIdToDelete.toHexString());
      if (productIndex !== -1) {
        // Remove the product from the array
        cart.products.splice(productIndex, 1);
      }
      const updatedCart = await cart.save();
      return updatedCart;

    } catch (err) {
      return err;
    }
  }

  //Vacia el carrito
  emptyCart = async (cid) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(cid)) {
        throw new Error('Invalid cart ID');
      }
      const updatedCart = await cartModel.findByIdAndUpdate(
        cid,
        { $set: { products: [] } },
        { new: true }
      );
      logger.logger.info(JSON.stringify(updatedCart, null, '\t'));
      return updatedCart;
    } catch (error) {
      return error;
    }
  }

  updateOneProductInCart = async (cid, cart) => {
    const updatedCart = await cartModel.findByIdAndUpdate(
      cid,
      {
        products: cart.map(product => ({ product, quantity: product.quantity })), //recorro el cart y traigo el producto y su cantidad
      },
      { new: true }
    ).populate('products.product').lean();
    logger.logger.info(JSON.stringify(updatedCart, null, '\t'));
    return updatedCart;
  };

};
