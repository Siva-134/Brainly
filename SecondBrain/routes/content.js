const express = require('express');
const router = express.Router();
const userAuth = require('../middleware/auth');
const Content = require('../models/content');
const Tag = require('../models/tag');
const ShareLink = require('../models/sharelink');
const crypto = require('crypto');

router.post('/add-content', userAuth, async (req, res) => {
    try {
        const { type, link, title, tags, platform, projectId } = req.body;

        if (!type || !link || !title) {
            return res.status(400).json({
                message: "Type, Link and Title are required"
            })
        }

        const tagIds = [];

        if (tags && tags.length > 0) {
            for (let tagTitle of tags) {
                let existingTag = await Tag.findOne({ title: tagTitle });

                if (!existingTag) {
                    existingTag = new Tag({ title: tagTitle });
                    await existingTag.save();
                }

                tagIds.push(existingTag._id);
            }
        }

        let thumbnail = '';
        try {
            if (link) {
               // Try to fetch metadata if Node version supports fetch (v18+)
               if (global.fetch) {
                   const controller = new AbortController();
                   const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout
                   const response = await fetch(link, { 
                       signal: controller.signal,
                       headers: {
                           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                           'Accept': 'text/html'
                       }
                   });
                   clearTimeout(timeoutId);
                   
                   if (response.ok) {
                       const html = await response.text();
                       const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
                       const twitterImage = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
                       thumbnail = ogImage ? ogImage[1] : (twitterImage ? twitterImage[1] : '');
                       
                       if (thumbnail && thumbnail.startsWith('/')) {
                           try {
                               const urlObj = new URL(link);
                               thumbnail = `${urlObj.protocol}//${urlObj.host}${thumbnail}`;
                           } catch (e) {
                               console.log("URL resolution err:", e);
                           }
                       }
                   }
               }
            }
        } catch (e) {
            console.log("Metadata fetch failed (ignoring):", e.message);
        }

        const newContent = new Content({
            type,
            link,
            title,
            tags: tagIds,
            platform,
            userId: req.user._id,
            projectId,
            thumbnail
        });

        await newContent.save();

        await newContent.populate('userId', 'name email');
        await newContent.populate('tags');

        return res.status(201).json({
            message: "Content Added Successfully",
            data: newContent
        })
    } catch (error) {
        return res.status(500).json({
            message: "Error adding content",
            error: error.message
        })
    }
});

router.put('/update-content/:contentId', userAuth, async (req, res) => {
    try {
        const { contentId } = req.params;
        const { type, link, title, tags, platform } = req.body;

        const content = await Content.findOne({ _id: contentId, userId: req.user._id });

        if (!content) {
            return res.status(404).json({
                message: "Content not found or you don't have permission to edit"
            })
        }

        const tagIds = [];

        if (tags && tags.length > 0) {
            for (let tagTitle of tags) {
                let existingTag = await Tag.findOne({ title: tagTitle });

                if (!existingTag) {
                    existingTag = new Tag({ title: tagTitle });
                    await existingTag.save();
                }

                tagIds.push(existingTag._id);
            }
        }

        content.title = title || content.title;
        content.link = link || content.link;
        content.type = type || content.type;
        content.platform = platform || content.platform;
        content.tags = tagIds.length > 0 ? tagIds : content.tags;

        await content.save();

        return res.status(200).json({
            message: "Content updated successfully",
            data: content
        })

    } catch (error) {
        return res.status(500).json({
            message: "Error updating content",
            error: error.message
        })
    }
});

router.get('/my-contents', userAuth, async (req, res) => {
    try {
        const { projectId } = req.query;
        let query = {
            $or: [
                { userId: req.user._id },
                { sharedWith: req.user._id }
            ]
        };

        if (projectId) {
            query = {
                userId: req.user._id,
                projectId: projectId
            };
        }

        const contents = await Content.find(query).populate('tags').populate('userId', 'name email');

        return res.status(200).json({
            message: "Contents fetched successfully",
            data: contents,
            currentUserId: req.user._id
        })
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching contents",
            error: error.message
        })
    }
});

router.post('/share-content', userAuth, async (req, res) => {
    try {
        const { contentId, targetUserId } = req.body;
        
        const content = await Content.findOne({ _id: contentId, userId: req.user._id });
        if (!content) {
            return res.status(404).json({ message: "Content not found or unauthorized" });
        }

        if (!content.sharedWith.includes(targetUserId)) {
            content.sharedWith.push(targetUserId);
            await content.save();
        }

        res.status(200).json({ message: "Content shared successfully" });
    } catch (e) {
        res.status(500).json({ message: "Error sharing content", error: e.message });
    }
});

router.delete('/remove-content/:contentId', userAuth, async (req, res) => {
    try {
        const { contentId } = req.params;

        const content = await Content.findOne({ _id: contentId, userId: req.user._id });

        if (!content) {
            return res.status(404).json({
                message: "Content not found or you don't have permission to delete"
            })
        }

        await Content.deleteOne({ _id: contentId });

        return res.status(200).json({
            message: "Content deleted successfully"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Error deleting content",
            error: error.message
        })
    }
});

router.post('/share-brain', userAuth, async (req, res) => {
    try {
        const existingShareLink = await ShareLink.findOne({ userId: req.user._id, isActive: true });

        if (existingShareLink) {
            return res.status(200).json({
                message: "Share link already exists",
                hash: existingShareLink.hash,
                shareUrl: `/brain/${existingShareLink.hash}`
            })
        }

        const hash = crypto.randomBytes(16).toString('hex');

        const newShareLink = new ShareLink({
            hash,
            userId: req.user._id,
            isActive: true
        });

        await newShareLink.save();

        return res.status(201).json({
            message: "Share link created successfully",
            hash: hash,
            shareUrl: `/brain/${hash}`
        })
    } catch (error) {
        return res.status(500).json({
            message: "Error creating share link",
            error: error.message
        })
    }
});

router.delete('/unshare-brain', userAuth, async (req, res) => {
    try {
        const shareLink = await ShareLink.findOne({ userId: req.user._id, isActive: true });

        if (!shareLink) {
            return res.status(404).json({
                message: "No active share link found"
            })
        }

        shareLink.isActive = false;
        await shareLink.save();

        return res.status(200).json({
            message: "Brain unshared successfully"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Error unsharing brain",
            error: error.message
        })
    }
});

const NodeCache = require('node-cache');
const brainCache = new NodeCache({ stdTTL: 300 }); // cache for 5 minutes

router.get('/brain/:hash', async (req, res) => {
    try {
        const { hash } = req.params;

        // Check cache first for lag-free loading
        if (brainCache.has(hash)) {
            return res.status(200).json({
                message: "Shared brain contents fetched successfully (cached)",
                data: brainCache.get(hash)
            });
        }

        const shareLink = await ShareLink.findOne({ hash, isActive: true });

        if (!shareLink) {
            return res.status(404).json({
                message: "Share link not found or inactive"
            })
        }

        const contents = await Content.find({ userId: shareLink.userId }).populate('tags').populate('userId', 'name email');

        // Set cache data
        brainCache.set(hash, contents);

        return res.status(200).json({
            message: "Shared brain contents fetched successfully",
            data: contents
        })
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching shared brain",
            error: error.message
        })
    }
});

router.put('/toggle-favorite/:contentId', userAuth, async (req, res) => {
    try {
        const { contentId } = req.params;
        const content = await Content.findOne({ _id: contentId, userId: req.user._id });

        if (!content) {
            return res.status(404).json({ message: "Content not found" });
        }

        content.isFavorite = !content.isFavorite;
        await content.save();

        return res.status(200).json({
            message: "Favorite toggled successfully",
            data: content
        });
    } catch (e) {
        return res.status(500).json({ message: "Error toggling favorite", error: e.message });
    }
});

module.exports = router;

