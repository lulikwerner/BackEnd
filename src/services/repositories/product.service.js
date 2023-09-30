export default class ProductRepository {

    constructor(dao) {
        this.dao = dao;
    }

    categoriesAndStatusService = () => {
        return this.dao.categoriesAndStatus();
    }

    getProductsService = () => {
        return this.dao.getProducts();
    }

    getProductByService = (pid) => {
        return this.dao.getProductBy(pid);
    }

    createProductService = (product) => {
        return this.dao.createProduct(product);
    }

    updateProductService = (id, product) => {
        return this.dao.updateProduct(id, product);
    }

    deleteProductService = (pid) => {
        return this.dao.deleteProduct(pid);
    }

}