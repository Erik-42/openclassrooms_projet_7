const express = require('express');
const auth = require('../middleware/auth.js');
const { upload, optimizeImage } = require('../middleware/multer-config.js');
const bookControllers = require('../controllers/bookControllers.js');

const router = express.Router();

router.post('/', auth, upload, optimizeImage, bookControllers.createBook);
router.get('/', bookControllers.getAllBooks);
router.get('/bestrating', bookControllers.bestRatings);
router.post('/:id/rating', auth, bookControllers.createRatings);
router.put('/:id', auth, upload, optimizeImage, bookControllers.modifyBook);
router.delete('/:id', auth, bookControllers.deleteOneBook);
router.get('/:id', bookControllers.getOneBook);

module.exports = router;
