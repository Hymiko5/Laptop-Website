const main = require('../config/db/connection').main;
const { default: mongoose } = require('mongoose');
 



const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.ObjectId, ref: 'User' },
    content: { type: String, trim: true, required: true },
    laptop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Laptop'
    },
    reply: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
}, { timestamps: true  })

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment ;