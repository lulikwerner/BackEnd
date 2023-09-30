import jwt from 'jsonwebtoken';

import config from '../config.js';
import { cookieExtractor } from '../utils.js';
import LoggerService from '../services/LoggerService.js';


const logger = new LoggerService(config.logger.type); 

const verifyCart = (req, res, next) => {

    const token = cookieExtractor(req);
    //Extraigo la informacion del TOKEN 
    const decodedToken = jwt.verify(token, config.tokenKey.key);
    logger.logger.debug('miTokenenverify',decodedToken)
    const cartInURL = req.params.cid;
    const cartValueFromToken = JSON.stringify(decodedToken.cart)
    logger.logger.debug('enlosparams',cartInURL)
    const trimmedCartValueFromToken = cartValueFromToken.replace(/"/g, '').trim();
 
   if(trimmedCartValueFromToken  !== req.params.cid) return  res.status(403).send({ status: 'error', error: 'Forbidden' });
   next();
};

export default verifyCart;



