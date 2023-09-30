import userModel from "../models/users.js";
import LoggerService from '../../../services/LoggerService.js';
import config from '../../../config.js';


const logger = new LoggerService(config.logger.type); 
export default class UsersManager {
  getUsers = () => {
    return userModel.find().lean();
  };

  getUserBy = async (param) => {
    try {
      const user = await userModel.findOne(param ).lean();

    return user;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  createUsers = async (user) => {
    return await userModel.create(user);
  };

  updateUsers = async (id, updateFields) => {
    return await userModel.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );
  };

  deleteUsers = (param) => {
    return userModel.findByIdAndDelete(param);
  };

  deleteManyUsers = (params) => {
    return userModel.deleteMany(params);
  }

}
