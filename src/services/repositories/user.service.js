export default class UserRepository  {

    constructor(dao){
        this.dao = dao;
    }
    
    getUsersService = () => {
        return this.dao.getUsers();
    };
    
    getUserByService = (params) => {
        return this.dao.getUserBy(params);
    };

    createUsersService = async (user) => {
        return  this.dao.createUsers(user);
    };

    updateUsersService = (id, user) => {
        return this.dao.updateUsers(id,user);
    };

    deleteUsersService = (id) => {
        return this.dao.deleteUsers(id);
    };

    deleteManyService = (params) => {
        return this.dao.deleteManyUsers(params);
    };

}