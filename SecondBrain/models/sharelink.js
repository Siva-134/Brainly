const mongoose = require('mongoose');

const shareLinkSchema = new mongoose.Schema({
    hash: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const ShareLink = mongoose.model("ShareLink", shareLinkSchema);

module.exports = ShareLink;
