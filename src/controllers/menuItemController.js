const MenuItem = require('../models/menuItemModel');
const Restaurant = require('../models/restaurantModel');
const { logError, isEmptyOrNull, removeFile } = require('../utils/services');

const getMenuByRestaurant = async (req, res) => {
    try {
        const id = req.params.id;
        const error = {};
        if (isEmptyOrNull(id)) {
            error.id = "Id is required";
        }
        if (Object.keys(error).length > 0) {
            return res.json({ error: error });
        }

        const restaurant = await Restaurant.findById(id).populate('menuItems');
        if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

        res.status(200).json({
            message: "List of Menu by restaurant",
            data: restaurant.menuItems,
        });
    } catch (error) {
        logError('menuItem.getMenuByRestaurant', error, res);
    }
}

const getMenuItemById = async (req, res) => {
    try {
        const id = req.params.itemId;
        const error = {};
        if (isEmptyOrNull(id)) {
            error.id = "Id is required";
        }
        if (Object.keys(error).length > 0) {
            return res.json({ error: error });
        }

        const menuItem = await MenuItem.findById(id).populate('restaurantId');
        if (!menuItem) return res.status(404).json({ message: 'Menu item not found' });

        res.status(200).json({
            message: "List of Menus",
            data: menuItem,
        });
    } catch (err) {
        logError('menuItem.getMenuItemById', err, res);
    }
};

const createMenuItem = async (req, res) => {
    try {
        // Use the restaurantId from the route parameter
        const restaurantId = req.params.id;

        const { code, name, description, price } = req.body; // Extract other fields from body

        // Validate restaurant existence
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

        let image;
        if (req.file) {
            image = req.file.filename; // Ensure image is only set if a file is uploaded
        }

        const newMenuItem = new MenuItem({
            restaurantId, // Use the restaurantId from the route parameter
            code,
            name,
            description,
            price,
            image,
        });

        const savedMenuItem = await newMenuItem.save();

        // Add menu item reference to the restaurant
        restaurant.menuItems.push(savedMenuItem._id);
        await restaurant.save();

        res.status(201).json({
            message: "Menu Item created successfully",
            data: savedMenuItem,
        });
    } catch (err) {
        console.error('Error in createMenuItem:', err); // Log the error
        logError('menuItem.createMenuItem', err, res);
        res.status(500).json({ message: "Server error" });
    }
};

const updateMenuItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { restaurantId, code, name, description, price } = req.body;
        const error = {};

        // Validate required fields
        if (isEmptyOrNull(itemId)) {
            error.itemId = "Id is required";
        }
        if (isEmptyOrNull(restaurantId)) {
            error.restaurantId = "RestaurantId is required";
        }
        if (isEmptyOrNull(code)) {
            error.code = "Code is required";
        }
        if (isEmptyOrNull(name)) {
            error.name = "Name is required";
        }
        if (isEmptyOrNull(price)) {
            error.price = "Price is required";
        } else if (isNaN(price)) {
            error.price = "Price must be a valid number";
        }

        // Return errors if any
        if (Object.keys(error).length > 0) {
            return res.status(400).json({ error });
        }

        // Find menu item by id
        const menuItem = await MenuItem.findById(itemId);
        if (!menuItem) {
            return res.status(404).json({ error: "Menu Item not found" });
        }

        let newImage = null;
        if (req.file) {
            newImage = req.file.filename;

            // Remove the old image if it exists
            if (menuItem.image) {
                try {
                    await removeFile(menuItem.image);
                } catch (error) {
                    console.error("Error deleting old image:", error);
                }
            }
        }

        // Update fields only if new values are provided
        menuItem.restaurantId = restaurantId || menuItem.restaurantId;
        menuItem.code = code || menuItem.code;
        menuItem.name = name || menuItem.name;
        menuItem.description = description || menuItem.description;
        menuItem.price = price || menuItem.price;
        menuItem.image = newImage || menuItem.image;

        // Save the updated menu item
        const updatedMenuItem = await menuItem.save();

        // Send response
        res.status(200).json({
            message: "Menu Item updated successfully",
            data: updatedMenuItem,
        });
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ error: 'Failed to update menu item' });
    }
}


const removeMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const error = {};
        if (isEmptyOrNull(id)) {
            error.id = "Id is required";
        }
        if (Object.keys(error).length > 0) {
            return res.json({ error: error });
        }

        const menuItem = await MenuItem.findById(id);
        if (!menuItem) {
            return res.status(404).json({ error: "Menu Item not found" });
        }

        if (menuItem.image) {
            try {
                await removeFile(menuItem.image);
            } catch (error) {
                console.error("Error deleting MenuItem image:", error);
            }
        }

        const deletemenu = await menuItem.deleteOne();
        await Restaurant.updateOne(
            { menuItems: id },
            { $pull: { menuItems: id } }
        );

        res.status(200).json({
            message: "MenuItem deleted",
        });
    } catch (error) {
        logError('menuItem.removeMenuItem', err, res);
    }
}

const getMenuItemCounts = async (req, res) => {
    console.log('Request received at /api/restaurant/items/counts');
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Invalid or missing "ids" array' });
        }

        // Assuming you have a MenuItem model that holds the items for each restaurant
        const counts = await Promise.all(
            ids.map(async (id) => {
                // Count the number of menu items associated with the restaurantId
                const count = await MenuItem.countDocuments({ restaurantId: id });
                return { restaurantId: id, count };
            })
        );

        res.status(200).json({ counts });
    } catch (error) {
        console.error('Error fetching menu item counts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};




module.exports = { getMenuByRestaurant, getMenuItemById, createMenuItem, updateMenuItem, removeMenuItem, getMenuItemCounts };