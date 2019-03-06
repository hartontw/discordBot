const mongoose = require('mongoose');

let commandSchema = new mongoose.Schema({
    dbMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    message: String,
    name: String,
    args: String,
    replies: [String],
    issues: [{
        code: String,
        message: String,
        stack: String
    }]
});

module.exports = mongoose.model('Command', commandSchema);