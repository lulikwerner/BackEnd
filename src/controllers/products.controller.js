import createProductDTO from '../dto/product/createProductDTO.js';
import { productService, userService } from '../services/repositories.js'
import { generateProducts } from '../mocks/products.mock.js';
import ErrorService from '../services/Error/ErrorService.js';
import { productsErrorIncompleteValue } from '../constants/productErrors.js';
import { productsInvalidValue } from '../constants/productErrors.js';
import EErrors from '../constants/EErrors.js'
import mongoose from 'mongoose';
import fs from 'fs'
import path from 'path'
import config from "../config.js";
import nodemailer from 'nodemailer'

const transport = nodemailer.createTransport({
    service:'gmail',
    port:587,
    auth:{
      user:config.app.email,
      pass:config.app.password
    }
  })


const postProducts = async (req, res, done) => {
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;
    const thumbnailBuffer = req.file ? req.file.buffer : null;
 
    try {
        //Si no me envian alguno de estos campos a excepcion de thumbnails(que no es obligatorio) arrojo error
        if (!title || !description || !code || !price || !status || !stock || !category) {
            ErrorService.createError({
                name: 'Product creation error',
                cause: productsErrorIncompleteValue(req.body),
                message: 'One or more fields are incomplete',
                code: EErrors.INCOMPLETE_VALUES,
                status: 400
            })
        }
        let thumbnail = 'No image';
        if (thumbnailBuffer) {
            // Convert buffer to base64-encoded string
            thumbnail = thumbnailBuffer.toString('base64');
          }

    const product = new createProductDTO(req.body,req.user.email)
        //Agrego el producto con la informacion enviada
        const addedProduct = await productService.createProductService(product);
        //Vuelvo a traer a mis productos
        const resultProducts = await productService.getProductsService();
        req.io.emit('resultProducts', resultProducts)
        //Si queda undefined o null tira error de agregar
        if (!addedProduct) return res.sendNotFound('Product not added');
        //Devuelo el producto agregado
        return res.send({ status: 'succes', payload: addedProduct })
    } catch (error) {
        done(error)
    }
};

const getProductsById = async (req, res, done) => {
    const { pid } = req.params;

    try {
        if (!pid || !mongoose.Types.ObjectId.isValid(pid)) {
            {
                ErrorService.createError({
                    name: 'Product input error',
                    cause: productsInvalidValue(req.params),
                    message: 'Please enter a valid product ID',
                    code: EErrors.INVALID_VALUE,
                    status: 400
                })
            }
        }
        const product = await productService.getProductByService({ _id: pid });
        // If the product is not found, send an error response
        if (!product) {
            return res.sendNotFound('Product not found');
        }
        // If the product is found, send the product information
        res.sendSuccessWithPayload({ payload: product });
    } catch (error) {
        done(error);
        // res.sendInternalError('Internal server error' );
    }
};

const putProducts = async (req, res, done) => {
    const { pid } = req.params;
    const productUpdate = req.body;
    //console.log(productUpdate)
   /* console.log(productUpdate.thumbnail)
    //const base64ImageData = productUpdate.thumbnail.toString('base64');
    const thumbnailBuffer = Buffer.from(productUpdate.thumbnail).toString('base64');
    productUpdate.thumbnail=thumbnailBuffer
    console.log(thumbnailBuffer)*/

    try {
        //Si no envian parametro de pid
        if (!pid || !mongoose.Types.ObjectId.isValid(pid)) {
            {
                ErrorService.createError({
                    name: 'Product input error',
                    cause: productsInvalidValue(req.params),
                    message: 'Please enter a valid product ID',
                    code: EErrors.INVALID_VALUE,
                    status: 400
                })
            }
        }

        //Si no se envia nada en el body a modificar
        if (Object.keys(productUpdate).length === 0) {
            return res.sendBadRequest('No updates provided. Product not modified');
        }
        //Chequeo que el pid existe en mi array de productos 
        const result = await productService.getProductByService({ _id: pid })
        if (!result) return res.sendNotFound('Product not updated because it cannot be found');
        const updateProduct = await productService.updateProductService(pid, productUpdate);

        //Si Modifico algo retorno que el producto fue modificado con exito
        if (updateProduct) return res.status(200).send({ status: 'success', message: `The product with id ${pid} has been succesfully updated` });
        //Sino devuelvot que no se pudo modifica
        return res.sendInternalError("Update product failed");
    }
    catch (error) {
        done(error);
    }
};

const deleteProducts = async (req, res, done) => {
    console.log(req.user.email)
    const { pid } = req.params
    try {
        if (!pid || !mongoose.Types.ObjectId.isValid(pid)) {
            ErrorService.createError({
                name: 'Product input error',
                cause: productsInvalidValue(req.params),
                message: 'Please enter a valid product ID',
                code: EErrors.INVALID_VALUE,
                status: 400
            })
        }
        //Busco el producto 
        const productoAEliminar =  await productService.getProductByService({ _id: pid })
        console.log(productoAEliminar)
        const emailUser =productoAEliminar.owner
        //Busco el user 
        const userProductoAEliminar = await userService.getUserByService ({ email: emailUser })
        const userOwnerRole =userProductoAEliminar.role
        if(userOwnerRole==='PREMIUM'){
            const result = await transport.sendMail({
                from:'Luli Store <config.app.email>',
                to:`${emailUser}`,
                subject:'Su producto fue eliminado',
                //Le doy el formato a mi email lo puedo guardar en un componentes
                html:`
                <div>
                <h1>Se elimino uno de sus productos </h1>
                <h2> Este mail es para confirmar que el producto ${pid} ha sido eliminado</h2>
                </div>`
            })
        }
        const resultDelete = await productService.deleteProductService({ _id: pid })
        //Busco el id del producto a eliminar si no lo encuentro devuelvo error sino devuelvo producto eliminado
        if (!resultDelete) return res.sendBadRequest('Product not found')
        return res.status(200).send({ status: 'success', message: { resultDelete } });
    }
    catch (error) {
        done(error);
    }
};

const mock = (req, res) => {
    const products = [];
    for (let i = 0; i < 100; i++) {
        products.push(generateProducts())
    }
    res.send({ status: 'success', payload: products })
}

export default {
    getProductsById,
    postProducts,
    putProducts,
    deleteProducts,
    mock
}

