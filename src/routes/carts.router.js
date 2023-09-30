import { Router } from 'express';

import cartManager from '../dao/fileSystem/Managers/cartManager.js';
import LoggerService from './src/services/LoggerService.js';
import config from './src/config.js';


const logger = new LoggerService(config.logger.type);
const router = Router();
const CartManager = new cartManager();


router.get('/:cid', async (req, res) => {
    const { cid } = req.params
    try {
        //Busco el carrito por el id que le estoy enviando
        const resultCart = await CartManager.getCartsById(Number(cid))
        //Si no lo encuentra arrojo error
        if (!resultCart) return res.status(400).send({ status: 'error', message: 'Enter a valid cart id' })
        //Si lo encuentra lo traigo
        return res.status(200).send({ resultCart });
    }
    catch (error) {
        logger.logger.error(error);
    }
});

router.post('/', async (req, res) => {
    try {
        const cart = req.body
        //Chequeo si cart es un array si no lo es devuelvo error
        if (!Array.isArray(cart)) return res.status(400).send({ status: 'error', message: 'Cart should be an array' });
        for (const product of cart) {
            //Para cada variable del array si no es un numero devuelvo que ingrese valores validos
            if (isNaN(product.pid) || isNaN(product.qty)) return res.status(400).send({ status: 'error', message: 'Enter valid values for all products' });
            //Para cada variable del array si no esta completo devuelvo error
            if (!product.pid || !product.qty) return res.status(400).send({ status: 'error', message: 'One or more fields are incomplete for a product' });
        }
        //Lo agrego al array cart
        const addedCart = await CartManager.addCart(cart);
        //Si no se agrego al carrito  envio error
        if (!addedCart) return res.status(400).send({ status: 'error', message: 'Product not found' });
        //Si se agrego envio 
        res.status(200).send({ addedCart });
    }
    catch (err) {
        logger.logger.error(error);
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { qty } = req.body;
        //Valido que el valor para el product id sea mayor a cero y un numero
        if (isNaN(pid) || pid < 0 || isNaN(cid) || cid < 0) return res.status(400).send({ status: 'error', message: 'Please enter a valid  value' });
        //Valido que entren una cantidad
        if (!qty) res.status(400).send({ status: 'error', message: 'Please enter a quantity' });
        //Valido que el valor que se envia como qty sea un numero y mayor a 0
        if (isNaN(qty) || qty < 0) return res.status(400).send({ status: 'error', message: 'Quantity should be a valid value' });
        const cart = await CartManager.getCartsById(parseInt(cid));
        //Busco el producto en el array de carrito
        const index = cart.products.findIndex(product => product.pid == pid);
        if (index !== -1) {
            //Si esta le sumo las cantidades
            cart.products[index].qty += Number(qty);
        } else {
            //Si no esta lo creo con las cantidades
            cart.products.push({ pid: Number(pid), qty: Number(qty) });
        }
        await CartManager.updateCart(cid, cart);
        return res.status(200).send({ status: 'success', message: 'Product added successfully' });
    } catch (error) {
        return res.status(400).send({ status: 'failed', message: 'Product could not be added' });
    }
});

export default router;