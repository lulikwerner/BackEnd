  import cartModel from "../models/carts.js";
  import productModel from "../models/products.js";
  import mongoose from "mongoose";

  export default  class CartManager {
      //Obtiene todos los carts
      getCarts = async() => {
    const populatedCart = await cartModel.find().populate('products.product').lean();;
    //console.log(JSON.stringify(populatedCart, null, '\t'));
    return populatedCart;  
      };
      //Obtiene un Cart por ID
      getCartBy = async (params) => {
          const populatedCart = await cartModel.findById(params).populate('products.product').lean();
          //console.log(JSON.stringify(populatedCart, null, '\t'));
          return populatedCart
      };
      //Crea un cart
      createCart = async (products) => {
        try {

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
      
 
      
      //Actualiza la cantidad en un cart
      updateCart = async (products, cid) => {
    try {
        //Busco el carrito
        const cart = await cartModel.findById(cid);
        for (const { pid, qty } of products) {
    //Busco el producto
        const product = await productModel.findById(pid);
        console.log('Found product:', product);
        //Si el producto existe busco si esta en el cart
        if (product) { 
          const existingProduct = cart.products.find(p => p.product.equals(product._id));
          //Si esta en el cart le sumo las cantidades
          if (existingProduct) {
            existingProduct.quantity += qty;
          } else {
            const newProduct = { product: product._id, quantity: qty };
            cart.products.push(newProduct);
            console.log('Added product:', newProduct);
          }
        }
      }
      await cart.save();
      console.log('Updated cart:', cart);
      return cart;
    } catch (error) {
      console.log('Error:', error);
      throw new Error('Failed to update the cart');
    }
      };
    //Actualiza los productos en un cart
     updateProductsInCart = async (cid, products, productId) => {
        try {
          return await cartModel.findOneAndUpdate(
            { _id: cid },
            { $set: { products: products } },
            { new: true }
          );
        } catch (err) {
          return err;
        }
      };

      

      

      updateQtyCart = async (cid, pid, qty) => {
      try {
        const cart = await cartModel.findById(cid).populate('products.product');
        const productIndex = cart.products.findIndex((p) => p.product._id.equals(pid));
        if (productIndex !== -1) {
          cart.products[productIndex].product.stock = qty;
          const updatedProduct = await cart.products[productIndex].product.save();
          return updatedProduct;
        } else {
          throw new Error('Product not found in cart');
        }
      } catch (error) {
        throw error;
      }
      }

      deleteCart = async (cid) => {
      return cartModel.findByIdAndDelete(cid)
      }
    
      deleteProductInCart = async (cid, products) => {
    try {
        return await cartModel.findOneAndUpdate(
            { _id: cid },
            { products },
            { new: true })

    } catch (err) {
        return err
    }
      }

      emptyCart = async (cid)=> {
    try {
      if (!mongoose.Types.ObjectId.isValid(cid)) {
        throw new Error('Invalid cart ID');
      }

      const updatedCart = await cartModel.findByIdAndUpdate(
        cid,
        { $set: { products: [] } },
        { new: true }
      );
      console.log(JSON.stringify(updatedCart, null, '\t'));
      return updatedCart;
    } catch (error) {
      return error;
    }
      }

  
  
  

  
  
  
  
  
  /*updateQtyCart = async (cid, pid, qty) => {
    try {
      console.log('hola');
      console.log(cid);
      console.log(pid);
      const updatedCart = await cartModel.findOneAndUpdate(
        { _id: cid },
        { $set: { 'products.$[elem].product.stock': qty } },
        { new: true, arrayFilters: [{ 'elem.product': mongoose.Types.ObjectId(pid) }] }
      ).populate('products.product').lean();
      console.log('chau');
      console.log('Updated cart:', updatedCart);
      return updatedCart;
    } catch (error) {
      return error;
    }
  };*/
  


};
