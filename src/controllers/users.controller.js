
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

import config from '../config.js';
import { generateToken } from '../services/auth.js';
import { userService } from '../services/repositories.js';
import LoggerService from '../services/LoggerService.js';
import RestoreTokenDTO from '../dto/user/RestoreTokenDTO.js';
import DTemplates from '../constants/DTemplates.js';
import MailingServices from '../services/mailService/mailService.js';
import { createHash, isValidPassword } from '../services/auth.js';
import UserDTO from '../dto/user/UserDTO.js';
import { usersServices } from '../dao/mongo/managers/index.js';


const logger = new LoggerService(config.logger.type);

const transport = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  auth: {
    user: config.app.email,
    pass: config.app.password,
  },
});

const register = (req, res) => {
  res.sendSuccess();
};

const login = (req, res) => {
  // El login recibe SIEMPRE en req.user
  logger.logger.info('eluser', req.user);
  const token = generateToken(req.user);
  res.cookie('authToken', token, {
    maxAge: 1000 * 3600 * 24,
    httpOnly: true,
  });
  res.sendSuccessWithPayload({ user: req.user });
};

const logout = async (req, res, next) => {
  //Traigo el usuario logeado y busco la fecha del del momento
  const userRole = req.user.role.toString();

  if (userRole != 'ADMIN') {
    const userId = req.user._id.toString();
    const currentDate = Date.now();
    //Actualizo el time connection por ser la ultima vez que tuvo actividad
    const updateTimeConnection = await usersServices.updateUsers(userId, {
      last_connection: currentDate,
    });
  }
  // Limpio la cookie
  res.clearCookie('authToken');
  // Lo envio al Login
  res.redirect('/login');
};

const loginGithub = (req, res) => {
  res.send({ status: 'success', message: 'Logged in with GitHub' });
};

const loginGitHubCallback = (req, res) => {
  const user = req.user;
  logger.logger.info('user', user);
  logger.logger.debug('el usuario git', user);

  try {
    const token = generateToken(req.user);
    logger.logger.info('token', token);
    res.cookie('authToken', token, {
      maxAge: 1000 * 3600 * 24,
      httpOnly: true,
    });
    logger.logger.debug('eltokenquenuevo', user);
    // Redirect the user to the /products page
    res.redirect('/products');
  } catch (error) {
    logger.logger.error('Error creating token:', error);
    res.sendInternalError(error);
  }
};

const current = (req, res) => {

  try {
    return res.sendSuccess(req.user);
  } catch (error) {
    return res.sendInternalError(error);
  }
};

const selectRole = async (req, res) => {
  try {
    const { uid } = req.params;
    const role = req.body;
    //Busco el usuario
    const user = await userService.getUserByService({ _id: uid })

    //Guardo los nombres de los campos que no se encuentren cargados en documents para enviarselos al
    const notUploadFiles = [];
    const expectedDocumentNames = ['bankProofFiles', 'addressProfFiles', 'iDriverFiles'];
    for (const expectedName of expectedDocumentNames) {
      const foundDocument = user.documents.find((document) => document.name === expectedName);

      if (!foundDocument) {
        if (expectedName === 'bankProofFiles') {
          notUploadFiles.push({ name: 'Comprobante de estado de cuenta' });
        } else if (expectedName === 'addressProfFiles') {
          notUploadFiles.push({ name: 'Comprobante de domicilio' });
        } else if (expectedName === 'iDriverFiles') {
          notUploadFiles.push({ name: 'DNI' });
        }
      }
    }

    //Si no tiene documentos o el array de documentos es igual a 0
    if (!user.documents || user.documents.length === 0) {
      res.status(400).json({ message: 'No se encontraron documentos para el usuario.' });
      return;
    }
    const iDriverDocument = user.documents.find(doc => doc.name === 'iDriverFiles');
    const addressProfFilesDocument = user.documents.find(doc => doc.name === 'addressProfFiles');
    const bankProofFileDocument = user.documents.find(doc => doc.name === 'bankProofFiles');

    //Si estan todos los docs cargados 
    if (iDriverDocument && addressProfFilesDocument && bankProofFileDocument) {
      //Hago el update de perfil
      const newRole = await userService.updateUsersService(uid, role);
      res.status(200).json({ message: 'User role updated successfully', newRole });
    } else {
      const response = {
        message: 'Faltan documentos para cargar. Por favor, suba todos los documentos requeridos.',
        notUploadFiles: notUploadFiles
      };

      res.status(400).json(response);
    }
  } catch (error) {
    logger.logger.error('Error updating user role:', error);
    res.status(500).json({ message: 'Failed to update user role', error });
  }
};

const restoreRequest = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.sendBadRequest('No se proporciono un email');
  const user = await userService.getUserByService({ email });

  if (!user) return res.sendBadRequest('Email no valido');

  const restoreToken = generateToken(RestoreTokenDTO.getFrom(user), 3600);  //Se crea el restoreToken
  const mailingService = new MailingServices();
  const result = await mailingService.sendMail(user.email, DTemplates.RESTORE, {
    restoreToken,
  });
  res.sendSuccess('Correo enviado exitosamente');
};

const restorePassword = async (req, res) => {
  const { password, token } = req.body;

  try {
    const tokenUser = jwt.verify(token, config.tokenKey.key);
    const user = await userService.getUserByService({ email: tokenUser.email });
    //Verificar que la contrasenia no es la misma a la que ya tenia
    const isSamePassword = isValidPassword(password, user.password);

    if (isSamePassword)
      res.sendBadRequest(
        'Su nueva contrasenia no puede ser igual a la anterior'
      );
    const newHashedPassword = await createHash(password);

    const updateuSER = await userService.updateUsersService(user._id, {
      password: newHashedPassword,
    });
    res.sendSuccess('Contrasenia modificada exitosamente');

  } catch (error) {
    console.log(error);
  }
};

const getUsers = async (req, res) => {
  try {
    const { uid } = req.params;
    const users = await userService.getUsersService();
    const userDTOs = users.map((user) => {
      return new UserDTO(user);
    });
    res.render('users', { userh: userDTOs });
  } catch (error) {
    console.error(error);
    res.status(500).send('An internal server error occurred.');
  }
};

const deleteUsers = async (req, res) => {
  //172,800,000 milliseconds
  //30 minutes * 60 seconds/minute * 1000 milliseconds/second = 1,800,000 milliseconds
  try {
    const dateToday = Date.now();
    const { uid } = req.params;
    const users = await userService.getUsersService();
    const deleteUsers = [];

    users.forEach((user) => {
      if (user.last_connection && user.role != 'ADMIN' && user.email != null) {
        // Calculo la diferencia entre cuando se conecto por ultima vez y el dia de hoy
        const connectionDate = dateToday - new Date(user.last_connection); // Convierto el date a un objeto
        if (connectionDate > 1800000) {
          deleteUsers.push(user);
          logger.logger.info('Empujar al arreglo delete', deleteUsers);
        }
      }
    });
    res.render('deleteUsers', { userh: deleteUsers });

  } catch (error) {
    console.error(error);
    res.status(500).send('An internal server error occurred.');
  }
};

const deleteInactiveUsers = async (req, res) => {
  const emailArray = req.body;
  const deletedUsers = [];
  console.log(emailArray);

  try {
    for (const obj of emailArray) {
      const email = obj.email;
      console.log('elid', obj)

      console.log('elemail', email);

      deletedUsers.push(email);
    }
    console.log(deletedUsers);

    const deletedUsersFilter = { email: { $in: deletedUsers } };
    const deletedUsersCount = await userService.deleteManyService(deletedUsersFilter);

    if (deletedUsersCount) {
      for (const obj of emailArray) {
        const email = obj.email;
        try {
          // Send email to the user
          const result = await transport.sendMail({
            from: 'Luli Store <config.app.email>',
            to: email,
            subject: 'Su cuenta ha sido eliminada',
            html: `
              <div>
                <h1>Eliminacion</h1>
                <h2>Su cuenta ha sido eliminada ya que no tuvo actividad en los ultimos dos dias</h2>
              </div>
            `,
          });
          console.log(`Email sent to: ${email}`);
        } catch (emailError) {
          console.error(`Error sending email to ${email}:`, emailError);
        }
      }
    }
    res.status(200).json({ message: 'Users deleted successfully', deletedUsers });

  } catch (error) {
    res.status(500).json({ message: 'An internal server error occurred' });
  }
};

const deleteuS = async (req, res) => {
  try {
    const { uid } = req.params;
    //Busco el usuario
    const userExist = await userService.getUserByService({ _id: uid })
    const userEmail = userExist.email

    if (userExist) {
      const deleteUser = await userService.deleteUsersService({ _id: uid });
      res.status(200).json({ message: 'Users deleted successfully' });

      if (deleteUser) {
        try {
          // Enviar email al usuario
          const result = await transport.sendMail({
            from: 'Luli Store <config.app.email>',
            to: userEmail,
            subject: 'Su cuenta ha sido eliminada',
            html: `
        <div>
          <h1>Eliminacion</h1>
          <h2>Su cuenta ha sido eliminada. Si cree que esto fue un error contacte al administrador</h2>
        </div>
      `,
          });
          console.log(`Email sent to: ${userEmail}`);
        } catch (emailError) {
          console.error(`Error sending email to ${userEmail}:`, emailError);
        }
      }
    } else {
      res.sendBadRequest({ message: 'User does not exist' })
    }

  } catch (error) {
    res.status(500).json({ message: 'An internal server error occurred' });
  }
}

const uploadDocuments = async (req, res) => {
  const { uid } = req.params;
  const updateFields = {};
  //Traigo al user
  const user = await userService.getUserByService({ _id: uid })

  function findFileByFieldname(files, fieldName) {
    for (const file of files) {
      if (file.fieldname === fieldName) {
        return file;
      }
    }
    return null;
  }

  try {
    const profileFiles = findFileByFieldname(req.files, 'profile');
    console.log('elproffile', profileFiles)
    const iDriverFiles = findFileByFieldname(req.files, 'iDriver');
    console.log('elidrive', iDriverFiles)
    const addressProofFiles = findFileByFieldname(req.files, 'addressProof');
    console.log('eladdre', addressProofFiles)
    const bankProofFiles = findFileByFieldname(req.files, 'bankProof');
    console.log('elbank', bankProofFiles)
    if (profileFiles) {
      await userService.updateUsersService(uid, { thumbnail: profileFiles });
    }

    const userDocuments = user.documents || [];

    if (iDriverFiles) {
      const existingIndex = userDocuments.findIndex(
        (doc) => doc && doc.name === 'iDriverFiles'
      );
      if (existingIndex !== -1) {
        // Si existe un documento con el mismo nombre del "array" lo modifica
        userDocuments[existingIndex] = {
          name: 'iDriverFiles',
          reference: iDriverFiles.filename,
        };
      } else {
        console.log('entroaca')
        // Si no lo empuja
        userDocuments.push({
          name: 'iDriverFiles',
          reference: iDriverFiles.filename,
        });
      }
    }

    // Chequea si se envio un documento en addressProfile
    if (addressProofFiles) {
        // Si existe un documento con el mismo nombre del "array"
      const existingIndex = userDocuments.findIndex(
        (doc) => doc && doc.name === 'addressProfFiles'
      );
      if (existingIndex !== -1) {
        // If an existing document with the same name exists, replace it
        userDocuments[existingIndex] = {
          name: 'addressProfFiles',
          reference: addressProofFiles.filename,
        };
      } else {
        console.log('entroaca')
        // If not, push the new document to the array
        userDocuments.push({
          name: 'addressProfFiles',
          reference: addressProofFiles.filename,
        });
      }
    }

    if (bankProofFiles) {
      const existingIndex = userDocuments.findIndex(
        (doc) => doc && doc.name === 'bankProofFiles'
      );
      if (existingIndex !== -1) {
        // Si existe un documento con el mismo nombre del "array" lo modifica
        userDocuments[existingIndex] = {
          name: 'bankProofFiles',
          reference: bankProofFiles.filename,
        };
      } else {
        console.log('entroaca')
        // Sino lo empuja al array
        userDocuments.push({
          name: 'bankProofFiles',
          reference: bankProofFiles.filename,
        });
      }
    }
    await userService.updateUsersService(uid, { documents: userDocuments });

    return res.sendSuccess('Los archivos fueron subidos exitosamente');
  } catch (error) {
    console.error('Error al cargar los archivos:', error);
    return res.sendInternalError('Uno o mas archivos no se pudieron cargar. Intentelo nuevamente');
  }
};


export default {
  register,
  login,
  logout,
  loginGithub,
  loginGitHubCallback,
  current,
  selectRole,
  restoreRequest,
  restorePassword,
  getUsers,
  deleteUsers,
  deleteInactiveUsers,
  deleteuS,
  uploadDocuments
};