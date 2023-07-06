const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, `${name}.${extension}`);
    }
});

const upload = multer({ storage }).single('image');

// Redimensionnement de l'image
const optimizeImage = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    const { destination, filename } = req.file;
    const outputFilename = `${filename.split('.')[0]}_${Date.now()}.webp`;
    // change redimensionne et change le format de l'image
    try {
        await sharp(req.file.path)
            .resize(206, 260)
            .webp({ quality: 70 })
            .toFile(`${destination}/${outputFilename}`);
    } catch (error) {
        return next(error);
    }

    req.file.filename = outputFilename;
    fs.unlink(`images/${filename}`, () => { })
    next();
};

module.exports = {
    upload,
    optimizeImage,
};