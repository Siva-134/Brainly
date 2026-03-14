const mongoose = require('mongoose');
const User = require('./models/user');
require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/secondbrain";

async function listUsers() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to MongoDB at:", MONGO_URL);
        
        const users = await User.find({}, 'email name');
        console.log("Registered Users:");
        users.forEach(u => {
            console.log(`- Name: ${u.name}, Email: '${u.email}'`);
        });
        
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

listUsers();
