const express = require('express');
const { uploadImage } = require('../utils/services');
const { getMenuByRestaurant, getMenuItemById, createMenuItem, updateMenuItem, removeMenuItem, getMenuItemCountByRestaurant, getMenuItemCounts } = require('../controllers/menuItemController');
const router = express.Router();

router.get('/:id', getMenuByRestaurant);
router.get('/view/:itemId', getMenuItemById);
router.post('/create/:id', uploadImage.single('image'), createMenuItem);
router.put('/update/:itemId', uploadImage.single('image'), updateMenuItem);
router.delete('/delete/:id', removeMenuItem);
router.post('/counts', getMenuItemCounts);

module.exports = router;