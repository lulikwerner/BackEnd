export default class UserDTO {
    constructor(user){
        this.id = user._id,  
        this.first_name = user.first_name ||'',
        this.last_name = user.last_name||'',//aca me tiene que traer el id del cart
        this.email = user.email,
        this.role = user.role,
        this.cart = user.cart || []
    }
}