import BaseRouter from "./Router.js";
import { passportCall } from '../services/auth.js';
import usersController from '../controllers/users.controller.js';

export default class SessionsRouter extends BaseRouter {

  init() {

    this.post('/register', ['NO_AUTH'], passportCall('register', { strategyType: 'locals' }), usersController.register);

    this.post('/login', ['NO_AUTH'], passportCall('login', { strategyType: 'locals' }), usersController.login);

    this.post('/logout', ['PRIVATE'], usersController.logout);

    this.get('/githubcallback', ['NO_AUTH'], passportCall('github', { strategyType: 'locals' }), usersController.loginGitHubCallback);

    this.get('/github', ['NO_AUTH'], passportCall('github', { strategyType: 'locals' }), usersController.loginGithub);

    this.get('/current', ['PRIVATE'], passportCall('jwt', { strategyType: "locals" }), usersController.current);

    this.post('/restoreRequest', ['NO_AUTH'], passportCall('jwt', { strategyType: "jwt" }), usersController.restoreRequest);

    this.post('/restorePassword', ['PUBLIC'], passportCall('jwt', { strategyType: "jwt" }), usersController.restorePassword);

  }
}












