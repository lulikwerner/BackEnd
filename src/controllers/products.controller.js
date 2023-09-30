import mongoose from 'mongoose';
import nodemailer from 'nodemailer'

import config from "../config.js";
import { productService, userService } from '../services/repositories.js'
import { generateProducts } from '../mocks/products.mock.js';
import ErrorService from '../services/Error/ErrorService.js';
import { productsErrorIncompleteValue } from '../constants/productErrors.js';
import { productsInvalidValue } from '../constants/productErrors.js';
import EErrors from '../constants/EErrors.js'
import createProductDTO from '../dto/product/createProductDTO.js';


const transport = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: config.app.email,
        pass: config.app.password
    }
})

const postProducts = async (req, res, done) => {
    console.log('post')
    let thumbnail = [req.file] || [];
    const { title, description, price, code, stock, status, category } = req.body;

    try {
        // Chequeo si algun campo quedo incompleto
        if (!title || !description || !price || !code || !stock || !status || !category) {
            ErrorService.createError({
                name: 'Product creation error',
                cause: productsErrorIncompleteValue(req.body),
                message: 'One or more fields are incomplete',
                code: EErrors.INCOMPLETE_VALUES,
                status: 400
            });
        }

        const product = new createProductDTO({
            title,
            description,
            price,
            code,
            stock,
            status,
            category,
            thumbnail
        }, req.body.userEmail);

        // Add the product with the information sent
        const addedProduct = await productService.createProductService(product);
        console.log(addedProduct);

        // If it's undefined or null, return an error
        if (!addedProduct) return res.sendNotFound('Product not added');

        // Return the added product
        return res.send({ status: 'success', payload: addedProduct });

    } catch (error) {
        done(error);
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

        // Si no encuentro el producto
        if (!product) {
            return res.sendNotFound('Product not found');
        }
        // Si encuentro el producto
        res.sendSuccessWithPayload({ payload: product });

    } catch (error) {
        done(error);
    }
};

const putProducts = async (req, res, done) => {
    const { pid } = req.params;
    const productUpdate = req.body;

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
    const emailUser = req.user.email;
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
        const productoAEliminar = await productService.getProductByService({ _id: pid })

        //Busco el user si no es admin
        if (emailUser !== config.adminPas.adminEmail) {
            const userProductoAEliminar = await userService.getUserByService({ email: emailUser })
            const userOwnerRole = userProductoAEliminar.role
            console.log('elrol', userOwnerRole)
            if (userOwnerRole === 'PREMIUM') {
                const result = await transport.sendMail({
                    from: 'Luli Store <config.app.email>',
                    to: `${emailUser}`,
                    subject: 'Su producto fue eliminado',
                    //Le doy el formato a mi email lo puedo guardar en un componentes
                    html: `
                <div>
                <h1>Se elimino uno de sus productos </h1>
                <h2> Este mail es para confirmar que el producto ${pid} ha sido eliminado</h2>
                </div>`
                })
            }
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
    mock,
}

