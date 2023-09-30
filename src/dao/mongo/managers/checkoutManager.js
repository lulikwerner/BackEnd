import checkoutModel from '../models/checkout.js';


export default class CheckoutManager {
      
    getCheckoutById = (params) => {
        //return checkoutModel.find({ params }).populate('ticket').lean();
      return checkoutModel.findOne(params).populate('ticket').lean();
    };

}