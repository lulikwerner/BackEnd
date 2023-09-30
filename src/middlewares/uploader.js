import multer from 'multer';

import { __dirname } from '../utils.js';


const storage = multer.diskStorage({

  destination: function (req, file, callback) {
    let folder;
    const fileName = file.fieldname;
    switch (fileName) {
      case 'thumbnail':
        folder = 'img/products';
        break;
      case 'profile':
        folder = 'img/profiles';
        break;
      case 'addressProof':
      case 'bankProof':
      case 'iDriver':
        folder = 'documents';
        break;
      default:
        folder = 'img';
        break;
    }
    callback(null, `${__dirname}/Public/${folder}`);
  },
  filename: function (req, file, callback) {
    callback(null, `${Date.now()}-${file.originalname}`);
  },
});

export const uploader = multer({ storage });

export default uploader;
