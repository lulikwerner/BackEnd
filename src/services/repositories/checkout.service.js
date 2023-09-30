export default class CheckoutRepository {

    constructor(dao){
        this.dao = dao;
    }

    getCheckoutServices = () => {
        return this.dao.getCheckout();
    }

    getCheckoutByIdService = () => {
        return this.dao.getCheckoutById ();
    }
    
}