import { Router } from 'express';

import productManager from '../managers/productManager.js';
import LoggerService from './src/services/LoggerService.js';
import config from './src/config.js';


const logger = new LoggerService(config.logger.type); 
const router = Router();
const ProductManager = new productManager();


router.get('/', async (req, res) => {
    const { limit } = req.query;
    try {
        //Traigo todos los productos si no me envian ningun limit
        const products = await ProductManager.getProducts();
        if (!limit) return res.status(200).render('home',products);
      
        //if (!limit) return res.status(200).send({ products });
        //Si el limit que me envian es menor a 0 o una letra me manda error
        if (limit<0 ||isNaN(limit)) return res.status(400).send({ status: 'error', message: 'Please enter a valid value' }); 
        //Si me envian un limit hago slice del array por el limite enviado y traigo solo esos productos
        const limitedProducts = products.slice(0, limit);
        return res.status(200).send({ limitedProducts });
    }
    catch (error) {
        logger.logger.error(error);
    }
});

router.get('/:pid', async (req, res) => {
    const { pid } = req.params
    try {
        const result = await ProductManager.getProductsById(Number(pid))
        //Si no me envian un numero envio mensaje de error
        if (pid<0 ||isNaN(pid)) return res.status(400).send({ status: 'error', message: 'Please enter a valid id' });
        // Si no encuentro el id enviado en el array arrojo producto no encontrado
        if (!result) return res.status(400).send({ status: 'error', message: 'Product not found' })
        //Si lo encuentro devuelvo la informacion del producto solicitado
        return res.status(200).send({ result });
    } catch (error) {
        logger.logger.error(error);
    }
})

router.post('/', async (req, res) => {

    const { title, description, code, price, status, stock, category, thumbnails } = req.body;
    try {
        //Si no me envian alguno de estos campos a excepcion de thumbnails(que no es obligatorio) arrojo error
        if (!title || !description || !code || !price || !status || !stock || !category) {
            return res.status(400).send({ status: "error", message: "One or more fields are incomplete" });
        }
        const product = {
            title,
            description,
            code,
            price,
            status: true,
            stock,
            category,
            thumbnail: thumbnails ? thumbnails.toString('base64') : 'No image'
        }
        //Agrego el producto con la informacion enviada
        const addedProduct = await ProductManager.addProducts(product);
        //Vuelvo a traer a mis productos
        const resultProducts = await ProductManager.getProducts();
        req.io.emit('resultProducts', resultProducts)
        //Si queda undefined o null tira error de agregar
        if (!addedProduct) return res.status(400).send({ status: 'error', message: 'Product not added' });
        //Devuelo el producto agregado
        return res.status(200).send({ addedProduct });
    } catch (error) {
        logger.logger.error(error);
    }
});

router.put('/:pid', async (req, res) => {
    const { pid } = req.params;
    const productUpdate = req.body;
    try {
        //Chequeo que el pid existe en mi array de productos 
        const result = await ProductManager.getProductsById(Number(pid))
        if(!result) return res.status(400).send({ status: 'error', message: 'Product not updated because it cannot be found' });
        const updateProduct = await ProductManager.updateProduct(pid, productUpdate);
        //Si Modifico algo retorno que el producto fue modificado con exito
        if (updateProduct) return res.status(200).send({ status: "success", message: `The product with id ${pid} has been succesfully updated` });
        //Sino devuelvot que no se pudo modifica
        return res.status(400).send({ error: "Update product failed" });
        
    }
    catch (error) {
        logger.logger.error(error);
    }

});

router.delete('/:pid', async (req, res) => {
    try {
        const { pid } = req.params
        const resultDelete = await ProductManager.deleteProduct(pid)
        //Busco el id del producto a eliminar si no lo encuentro devuelvo error sino devuelvo producto eliminado
        if (!resultDelete) return res.status(400).send({ status: 'error', message: 'Product not found' })
        return res.status(200).send({ status: 'success', message: { resultDelete } });
    }
    catch (error) {
        logger.logger.error(error);
    }
});

export default router;