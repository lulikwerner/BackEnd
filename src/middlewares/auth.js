import { cookieExtractor } from '../utils.js';


export const privacy = (privacyType) => {

  return (req, res, next) => {
    // Extraigo el user de la cookie
    const user = cookieExtractor(req);

    switch (privacyType) {
      //En caso de ser Privado
      case 'PRIVATE':
        // Si el usuario esta logeado
        if (user) {
          next();
        } else {
          //Si no esta logeado lo redirijo a login
          res.redirect('/login');
        }
        break;
      //En el caso de ser NO_AUTH
      case 'NO_AUTH':
        // Si no esta logeado el usuario continuo
        if (!user) {
          next();
        } else {
          // Si el usuario esta logeado
          res.redirect('/products');
        }
        break;
    }
  };
};
