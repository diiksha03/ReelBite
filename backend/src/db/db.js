const mongoose = require('mongoose');

const connectdb = async () => {
    try {
        const url = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/canteen";
        
        await mongoose.connect(url);
        console.log("MongoDB Connected successfully!");
    } catch (error) {
        console.log("mongodobo connected error : ", error);
    }
}

module.exports = connectdb;