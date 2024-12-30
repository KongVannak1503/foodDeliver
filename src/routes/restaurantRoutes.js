const express = require('express');
const { getList, getOne, create, update, remove } = require('../controllers/restaurantController');
const { uploadImage } = require('../utils/services');
const router = express.Router();

router.get('/', getList);
router.get('/:id', getOne);
router.post('/', uploadImage.single('image'), create);
router.put('/:id', uploadImage.single('image'), update);
router.delete('/:id', remove);

module.exports = router;