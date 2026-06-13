const foodModel = require('../models/fooditem.model.js'); 
const storageService = require('../services/storage.service'); 
const likeModel = require("../models/like.model.js"); 
const saveModel = require("../models/save.model.js"); 
const { v4: uuid } = require("uuid");
const path = require("path");

// 1. Create Food Item
async function createFood(req, res) {
    try {
        const fileExtension = path.extname(req.file.originalname) || '.mp4'; 
        const uniqueFileName = `${uuid()}${fileExtension}`;

        const fileUploadResult = await storageService.uploadFile(req.file.buffer, uniqueFileName);

        const foodItem = await foodModel.create({
            name: req.body.name,
            description: req.body.description,
            video: fileUploadResult.url,
            foodPartner: req.foodPartner._id,
            likeCount: 0,
            savesCount: 0
        });

        res.status(201).json({
            message: "food created successfully",
            food: foodItem
        });
    } catch (error) {
        console.error("Error creating food item:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// 2. Get All Food Items
async function getFoodItems(req, res) {
    try {
        const foodItems = await foodModel.find({});
        const user = req.user; 

        const processedFoods = await Promise.all(foodItems.map(async (food) => {
            // MongoDB collections se live counts nikaalein taaki mismatch ka chance hi na rahe
            const totalLikes = await likeModel.countDocuments({ food: food._id });
            const totalSaves = await saveModel.countDocuments({ food: food._id });

            let isLikedByMe = false;
            let isSavedByMe = false;

            if (user && user._id) {
                const likedDoc = await likeModel.findOne({ user: user._id, food: food._id });
                const savedDoc = await saveModel.findOne({ user: user._id, food: food._id });
                isLikedByMe = !!likedDoc;
                isSavedByMe = !!savedDoc;
            }

            return {
                ...food.toObject(),
                likeCount: totalLikes,
                savesCount: totalSaves, 
                isLikedByMe,
                isSavedByMe
            };
        }));

        res.status(200).json({
            message: "Food items fetched successfully",
            foodItems: processedFoods
        });
    } catch (error) {
        console.error("Error fetching food items:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// 3. Like/Unlike Food 
async function likeFood(req, res) {
    try {
        const { foodId } = req.body;
        const user = req.user;

        if (!user || !user._id) {
            return res.status(401).json({ message: "Unauthorized. Please login again." });
        }

        const isAlreadyLiked = await likeModel.findOne({ user: user._id, food: foodId });

        if (isAlreadyLiked) {
            await likeModel.deleteOne({ user: user._id, food: foodId });
            await foodModel.findByIdAndUpdate(foodId, { $inc: { likeCount: -1 } });

            const freshLikesCount = await likeModel.countDocuments({ food: foodId });
            return res.status(200).json({
                message: "Food unliked successfully",
                likeCount: freshLikesCount,
                isLikedByMe: false
            });
        }

        await likeModel.create({ user: user._id, food: foodId });
        await foodModel.findByIdAndUpdate(foodId, { $inc: { likeCount: 1 } });

        const freshLikesCount = await likeModel.countDocuments({ food: foodId });
        return res.status(200).json({
            message: "Food liked successfully",
            likeCount: freshLikesCount,
            isLikedByMe: true
        });

    } catch (error) {
        console.error("Error inside likeFood controller:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

// 4. Save/Unsave Food 
async function saveFood(req, res) {
    try {
        const { foodId } = req.body;
        const user = req.user;

        if (!user || !user._id) {
            return res.status(401).json({ message: "Unauthorized. Please login again." });
        }

        const isAlreadySaved = await saveModel.findOne({ user: user._id, food: foodId });

        if (isAlreadySaved) {
            await saveModel.deleteOne({ user: user._id, food: foodId });
            await foodModel.findByIdAndUpdate(foodId, { $inc: { savesCount: -1 } });

            const freshSavesCount = await saveModel.countDocuments({ food: foodId });
            return res.status(200).json({
                message: "Food unsaved successfully",
                savesCount: freshSavesCount,
                isSavedByMe: false
            });
        }

        await saveModel.create({ user: user._id, food: foodId });
        await foodModel.findByIdAndUpdate(foodId, { $inc: { savesCount: 1 } });

        const freshSavesCount = await saveModel.countDocuments({ food: foodId });
        return res.status(200).json({
            message: "Food saved successfully",
            savesCount: freshSavesCount,
            isSavedByMe: true
        });

    } catch (error) {
        console.error("Error inside saveFood controller:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}
async function getSaveFood(req, res) {
    try {
        const user = req.user;

        if (!user || !user._id) {
            return res.status(401).json({ message: "Unauthorized. Please login again." });
        }

        const savedFoods = await saveModel.find({ user: user._id }).populate('food');

        if (!savedFoods || savedFoods.length === 0) {
            return res.status(200).json({
                message: "No saved foods found",
                savedFoods: []
            });
        }

        const formattedSaved = await Promise.all(savedFoods.filter(item => item && item.food).map(async (item) => {
            const foodId = item.food._id;

        
            const totalLikes = await likeModel.countDocuments({ food: foodId });
            const totalSaves = await saveModel.countDocuments({ food: foodId });
            
           
            const likedDoc = await likeModel.findOne({ user: user._id, food: foodId });
            const isLikedByMe = !!likedDoc; 

            return {
                ...item.food.toObject(),
                _id: foodId,
                id: foodId,
                likeCount: totalLikes,
                savesCount: totalSaves,
                isLikedByMe: isLikedByMe, 
                isSavedByMe: true       
            };
        }));

        res.status(200).json({
            message: "Saved foods retrieved successfully",
            savedFoods: formattedSaved
        });

    } catch (error) {
        console.error("Error inside getSaveFood controller:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}


module.exports = {
    createFood,
    getFoodItems,
    likeFood,
    saveFood,
    getSaveFood
};