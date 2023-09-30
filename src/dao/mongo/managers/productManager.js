import productModel from "../models/products.js";
import LoggerService from '../../../services/LoggerService.js';
import config from '../../../config.js';


const logger = new LoggerService(config.logger.type); 

export default class ProductManager {

    categoriesAndStatus = async () => {
    try {
      const categoriesData = await productModel.aggregate([
        {
          $group: {
            _id: null,
            categories: { $addToSet: "$category" },
            statuses: { $addToSet: "$status" }
          }
        }
      ]);
      logger.logger.info(categoriesData);
      const { categories, statuses } = categoriesData[0];
      return { categories, statuses };
    } catch (error) {
      logger.logger.error(error);
      return error;
    }
  };

    getProducts = () => {
        return productModel.find().lean();
    };
    
    getProductBy = (params) => {
        return productModel.findOne(params).lean();
    };

    createProduct = async (product) => {
      console.log('enelcreate',product)
        return await productModel.create(product);
    };

    updateProduct= async (id, update) => {
      try {
        const updatedProduct = await productModel.findByIdAndUpdate(id, update, { new: true });
        return updatedProduct;
      } catch (error) {
        logger.logger.error('Error updating product:', error);
        throw error;
      }
    };
    
    deleteProduct = (id) => {
        return productModel.findByIdAndDelete(id);
    };
}


