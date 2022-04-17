const main = require('../config/db/connection').main;
const { default: mongoose } = require('mongoose');
const ObjectID = require('mongodb').ObjectID;



const userSchema = new mongoose.Schema({
    userName: { type: String, required: [true, "can't be blank"], index: true },
    email: { type: String, required: [true, "can't be blank"], unique: true, match: [/\S+@\S+\.\S+/, 'is invalid'], index: true },
    phoneNumber: { type: String, match: [/^\+[0-9]{2,4}-[0-9]{8,11}$/, 'invalid phone number'] },
    photo: { type:String, default: 'public/avatar_author.jpg' },
    password: { type: String },
    facebook: {
        id: String,
        displayName: String,
        email: String,
        photo: String
    },
    google: {
        id: String,
        displayName: String,
        email: String,
        photo: String
    }
}, { timestamps: true  })

const User = mongoose.model('User', userSchema);
module.exports = User ;