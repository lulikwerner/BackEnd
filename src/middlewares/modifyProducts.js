import jwt from 'jsonwebtoken';

import config from '../config.js';
import { cookieExtractor } from '../utils.js';
import LoggerService from '../services/LoggerService.js';
import { productService } from '../services/repositories.js';


const logger = new LoggerService(config.logger.type);

const modifyProducts = async (req, res, next) => {
  const token = cookieExtractor(req);
  const decodedToken = jwt.verify(token, config.tokenKey.key);
  logger.logger.debug('miTokenenverify', decodedToken);
  const pidInURL = req.params.pid;

  try {
    logger.logger.debug('enlosparams', pidInURL);
    const product = await productService.getProductByService({ _id: pidInURL });
    // Chequeo si el token  decodeado tiene el email del admin
    if (decodedToken.email === 'adminCoder@coder.com') return next();
    // Chequeo si el token  decodeado matchea el email  del product owner
    if (decodedToken.email !== product.owner) return res.status(403).send({ status: 'error', error: 'You are not the owner of the product' });
    next();
  } catch (error) {
    logger.logger.error('Error fetching product:', error);
    return res.status(500).send('Error fetching product');
  }
};

export default modifyProducts;
