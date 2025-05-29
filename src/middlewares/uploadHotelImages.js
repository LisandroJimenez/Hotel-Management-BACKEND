import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Asegurarse de que la carpeta exista
const uploadPath = 'uploads/hotels/';
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}${ext}`);
    }
});

const uploadHotelImages = multer({ storage });

export default uploadHotelImages;
