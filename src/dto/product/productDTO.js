export default class productDTO {

    constructor(product){
        this._id = product._id
        this.title = product.title ||' Sin titulo',
        this.price = product.price || 'Le falta el precio',
        this.code = product.code ||'Aignar un code',
        this.description = product.description || 'Sin descripcion',
        this.status = product.status || 'active',
        this.stock = product.stock || 0,
        this.category = product.category || 'Sin categoria asignada',
        this.thumbnails = product.thumbnails|| 'No image'
    }
    
}