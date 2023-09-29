import jwt from 'jsonwebtoken'
import { productService, cartService, userService } from '../services/repositories.js';
import productModel from '../dao/mongo/models/products.js';
import TokenDTO from '../dto/user/TokenDTO.js';
import AdminDTO from '../dto/user/AdminDTO.js';
import LoggerService from '../services/LoggerService.js';
import config from '../config.js';
import nodemailer from 'nodemailer'
import twilio from "twilio";

const logger = new LoggerService(config.logger.type); 

const transport = nodemailer.createTransport({
  service:'gmail',
  port:587,
  auth:{
    user:config.app.email,
    pass:config.app.password
  }
})

const twilioClient = twilio(config.twilio.sid, config.twilio.Token)

const welcome = async (req,res) => {
  res.render('welcome');
}

const  realTimeProducts = async (req, res) => {
    const products = await productService.getProductsService();
    res.render('realTimeProducts', { producth: products, user: req.user });
};

const getProducts = async (req, res) => {
    const { limit, page = 1, sort, category } = req.query;
  
    try {
    const user = req.user;
    logger.logger.debug('en la ruta', user);
      if (limit) {
        const products = await productService.getProductsService();
  
        if (limit < 0 || isNaN(limit)) {
          return res.sendBadRequest('Please enter a valid value for limit.' );
        }
        const limitedProducts = products.slice(0, limit); 
        return res.render('home', { producth: limitedProducts, user: user });
      }
  
      if (page) {
        const query = category ? { category } : {};
        const sortQuery = sort === 'desc' ? { price: -1 } : { price: 1 };
        const { docs, hasPrevPage, hasNextPage, prevPage, nextPage, ...rest } = await productModel.paginate(query, { page, limit: 10, sort: sortQuery, lean: true });
        const producth = docs;
        const response = {
          status: 'success',
          payload: docs,
          totalPages: rest.totalPages,
          prevPage: prevPage,
          nextPage: nextPage,
          page: rest.page,
          hasPrevPage: hasPrevPage,
          hasNextPage: hasNextPage,
          prevLink: hasPrevPage ? `/?limit=${limit}&page=${prevPage}&sort=${sort}&category=${category}` : null,
          nextLink: hasNextPage ? `/?limit=${limit}&page=${nextPage}&sort=${sort}&category=${category}` : null
        };
        logger.logger.info(response);
        return res.render('home', { producth, hasPrevPage, hasNextPage, prevPage, nextPage, ...rest, user: user});
      }
  
      const products = await productService.getProductsService();
      const { categories, statuses } = await  productService.categoriesAndStatusService();
      logger.logger.debug('entro en categoria');
      logger.logger.info('el usuario', user);
      return res.render('home', { producth: products, categories, statuses, user: user });
    } catch (error) {
      console.error(error);
      return res.sendInternalError ('An internal server error occurred.' );
    }
};
  
const chat = async(req,res)=>{
    res.render('chat');
};

const productsInCart = async(req,res)=>{
  logger.logger.debug('incart');
    const { cid } = req.params;
    const carts = await cartService.getCartByIdService(cid);
    res.render('cart', { carth: carts});
};

const register = async(req,res)=>{
    res.render('register');
};

const login = async(req,res)=>{
    res.render('login');
};
  
const profile = async (req, res) => {
  try {
    const user = new TokenDTO(req.user) || new AdminDTO(req.user);
    console.log(user)
    res.render('profile', { user: user });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
};

const mail =  async (req,res) => {
  const result = await transport.sendMail({
    from:'Luli Store <config.app.email>',
    to:'inforpmusa@gmail.com',
    subject:'Correo de prueba',
    //Le doy el formato a mi email lo puedo guardar en un componentes
    html:`
    <div><h1>Esto es un correo de prueba</h1></div>`
    //dentro de las bastics <img src='cid:perfilbonito'/>
    /*,
    attachments:[
      {
        filename:'Curriculum.pdf',
        path://ruta donde lo tengo guardado al file
      },
      {
        filename:'perritoDeprimido.jpg',
        path://ruta donde lo tengo guardado la foto,
        cid:'perfilbonito'
      }
    ]*/
  })
  res.send({status:'succes', payload:result})
}

const sms = async (req,res) => {
  const clientNumber = '+9543832654';
  const result = await twilioClient.messages.create({
    body:'SMS de prueba',
    from: config.twilio.Number,
    to:clientNumber
  })
  res.send({status:'succes', payload:result})
}

const profileRole = async (req,res) => {
  const { uid } = req.params;
  try {
    const user= await userService.getUserByService({_id: uid})
    logger.logger.debug(user);
    // Si no encuentra el user
    if (!user) {
      return res.sendBadRequest('User not found');
    }
    // Si el user se encuentra renderizo la info
    res.render('userRole', { userh: user});
} catch (error) {
    return res.sendInternalError(error);
}
}

const restoreRequest = (req,res) => {
  res.render('restoreRequest')
}

const restorePassword = (req,res) => {
  const {token} = req.query;
  try{
    const validToken = jwt.verify(token, config.tokenKey.key);
    res.render('restorePassword')
  }catch(error){
   return res.render('invalidToken');
  }
  res.render('restorePassword')
}

const showUser = async (req,res) => {
  res.render('searchUser');
}

const searchUser = async (req, res) => {
  const { uid } = req.params;
  try {
    const findUser = await userService.getUserByService({ _id: uid });
    logger.logger.debug(findUser)
    if (findUser) {
      // Include user data and success status in the response and render the template
      res.status(200).render('modify', { user: findUser, success: true });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch the user", error });
  }
};

const upload = async (req, res) => {
  const { uid } = req.params;
  res.render('uploadDocuments', { uid }); 
};



export default {
    welcome,
    realTimeProducts,
    getProducts,
    chat,
    productsInCart,
    register,
    login,
    profile,
    mail,
    sms,
    profileRole,
    restoreRequest,
    restorePassword,
    showUser,
    searchUser,
    upload 
}
