// Do not change this file
require('dotenv').config();

const mongoose = require('mongoose');

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');
}



module.exports = { main };