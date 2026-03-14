const mongoose = require('mongoose');
const Tag = require('./tag');
const User = require('./user');


const contentSchema = new mongoose.Schema({
    link: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['image', 'audio', 'video', 'article', 'git_repo'],
        required: true
    },
    platform: {
        type: String,
        required: false
    },
    title: {
        type: String,
        required: true
    },
    tags: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tag',
            index: true
        }
    ],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        index: true
    },
    sharedWith: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: false,
        index: true
    },
    isFavorite: {
        type: Boolean,
        default: false
    },
    thumbnail: {
        type: String,
        required: false
    }
});

const Content = mongoose.model("Content", contentSchema);

module.exports = Content;
