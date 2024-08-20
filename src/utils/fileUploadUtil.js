import multer  from "multer";
import  path  from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const avatarUpload = (imagePath) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      let img_path = imagePath ? imagePath : "/images";
      cb(null, path.join(__dirname, `../public${img_path}`));
    },
    filename: function (req, file, cb) {
      const filename = Date.now() + "-" + file.originalname;
      cb(null, filename);
    },
  });
};

const pdfUpload = (imagePath) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      let img_path = imagePath ? imagePath : "/uploads";
      cb(null, path.join(__dirname, `../public${img_path}`));
    },
    filename: function (req, file, cb) {
      const filename = Date.now() + "-" + file.originalname;
      cb(null, filename);
    },
  });
};
export  {
  avatarUpload,
  pdfUpload,
};
