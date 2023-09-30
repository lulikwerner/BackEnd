import BaseRouter from "./Router.js";
import { passportCall } from '../services/auth.js';
import usersController from '../controllers/users.controller.js';
import uploader from "../middlewares/uploader.js";

export default class UsersRouter extends BaseRouter {

  init() {


    this.get('/', ['ADMIN'], passportCall('jwt', { strategyType: "jwt" }), usersController.getUsers);

    this.get('/delete', ['ADMIN'], passportCall('jwt', { strategyType: 'jwt' }), usersController.deleteUsers);

    this.post('/search/:uid', ['ADMIN'], passportCall('jwt', { strategyType: "jwt" }), usersController.modifyUser);

    this.put('/premium/:uid', ['PRIVATE'], passportCall('jwt', { strategyType: "locals" }), usersController.selectRole);

    this.post('/premium/:uid/documents', ['PRIVATE'], passportCall('jwt', { strategyType: "jwt" }), uploader.any(), usersController.uploadDocuments)

    this.delete('/search/:uid/delete', ['ADMIN'], passportCall('jwt', { strategyType: "jwt" }), usersController.deleteuS)

    this.delete('/delete', ['ADMIN'], passportCall('jwt', { strategyType: "jwt" }), usersController.deleteInactiveUsers);

  }
}
