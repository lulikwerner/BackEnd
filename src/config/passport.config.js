import passport from "passport";
import local from "passport-local";
import {Strategy, ExtractJwt} from 'passport-jwt';
import { usersServices } from '../dao/mongo/managers/index.js'


import GithubStrategy from "passport-github2";
import { createHash, isValidPassword } from "../services/auth.js";
import { cookieExtractor } from "../utils.js";


const LocalStrategy = local.Strategy; //Es la estrategia
const JWTStrategy = Strategy;

const initlizePassportStrategies = () => {
  console.log('entro al initialized')
//username y password son obligatorios extraerlos por eso te lo pide. Pongo el valor en true passReqToCallback: true para que me deje extraer la otra info del user y le digo que el email va a ser el username field usernameField:'email' 
passport.use('register',new LocalStrategy({passReqToCallback: true, usernameField:'email'}, async(req,email,password,done) => {     
  try{
        //Aca extraigo todo lo que quiero que no sea username y password
        const { first_name, last_name, age, role } = req.body;
        //Corroboro que completen todos los campos de registro
      if(!first_name || !last_name || !age || !email || !password){
          return done(null,false, { message: 'Por favor completar todos los campos' });
        } 
        //Busco si ya existe el usuario
        const exists = await usersServices.getUserBy({email});
        if(exists) done(null,false,{message:'El usuario ya existe'})
        //Si no existe el usuario en la db. Encripto la contrasenia
        const hashedPassword = await createHash(password);

        //Construyo el usuario que voy a registrar
        const newUser = {
          first_name,
          last_name,
          age, 
          role,
          email,
          password:hashedPassword
        }
          const result = await usersServices.createUsers(newUser);
          console.log('el resultado es',result)
          //Si todo salio ok,
          done(null,result);
        }catch(error){
            done(error) 
        }
}))

//le digo que el email va a ser el field username
passport.use('login', new LocalStrategy({usernameField:'email'},async(email, password,done)=>{
    //PASSPORT SOLO DEBE DEVOLVER EL USUARIO FINAL. NO ES RESPONSABLE DE LA SESION
    let user;
    try{
    if(email === "adminCoder@coder.com" && password==="adminCod3r123" ){
      //Aca inicializo el admin
      const user = {
        id:0,
        first_name: `Admin`,
        last_name:`Admin`,
        age:0,
        cart:0,
        role: 'admin',
        email: '...'
      }
      return done(null, user);
    }
    user = await usersServices.getUserBy ({email}); //Solo busco por email
    if (!user) return done(null,false,{message: "Credenciales incorrectas" });
    

    // Si el usuario existe valido el pw
    const isPasswordValid   = await isValidPassword(password,user.password);
    console.log(password)
    console.log(user.password)
    if(!isPasswordValid ) return done(null,false,{message:"contrasenia incorrecta"});

    //Si el usuario existe y la contrasenia es correcta entonces devuelvo la sesion en passport
    user = {
        id:user._id,  
        first_name: user.first_name,
        last_name: user.last_name,
        age:user.age,
        cart: user.cart, //aca me tiene que traer el id del cart
        email: user.email,
        role: user.role
    };
    return done(null,user);

  }catch(error){
    return done(error);
  }
}));


passport.use('github', new GithubStrategy({
  clientID:"Iv1.1dd1410ac14946b5",
  clientSecret:"795760751219fa0e7038b9f9bbaa1e1f5d768235",
  callbackURL:"http://localhost:8080/api/sessions/githubcallback"
}, async(accessToken, refreshToken, profile, done )=>{
    try{
      console.log('el perfil',profile);
      //Tomo los datos que me sirven
      const{name,email} = profile._json;
      const user = await usersServices.getUserBy ({email});
      if(!user){
        //Si el usuario no existe lo creo yo
        const newUser = {
          first_name: name,
          email,
          age:23,
          password:''
        }
        //Creo el nuevo usuario
        const result = await usersServices.createUsers(newUser);
        done(null,result)
      }
      //Si el usuario ya existia
      done(null,user);

    }catch(error){
      done(error);
    }
}))

passport.use('jwt', new JWTStrategy({
  jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
  secretOrKey: 'jwtSecret'
}, async (payload, done) => {
  try {
    const userId = payload.id || payload._id;
    console.log('eluserquetengo',userId)
    const user = await usersServices.getUserBy({ _id: userId });
    if (user) {
      console.log('User found:', user); // Add console.log statement to check user object
      return done(null, user);
    } else {
      console.log('User notfound'); // Add console.log statement for user not found
      return done(null, false);
    }
  } catch (error) {
    console.error('Error fetching user:', error); // Add console.error statement for error handling
    return done(error);
  }
}));


};
export default initlizePassportStrategies;