const mongoose = require('mongoose');

let messageSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true,
    },
    channel: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    guild: String,
    member: String,
});

module.exports = mongoose.model('Message', messageSchema);